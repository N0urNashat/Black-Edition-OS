import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';

/**
 * GET /api/analytics/dashboard
 * Get aggregated dashboard analytics from all modules
 */
export async function getDashboardAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Calculate start of month for "thisMonth" stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Fetch lead stats
    const [
      totalLeads,
      leadsByStatus,
      leadsThisMonth,
      leadScoreAvg,
    ] = await Promise.all([
      prisma.lead.count({ where: { organizationId } }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
      prisma.lead.count({
        where: { organizationId, createdAt: { gte: startOfMonth } },
      }),
      prisma.lead.aggregate({
        where: { organizationId },
        _avg: { score: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    leadsByStatus.forEach((item: any) => {
      statusCounts[item.status] = item._count;
    });

    const leadStats = {
      total: totalLeads,
      new: statusCounts['NEW'] || 0,
      qualified: statusCounts['QUALIFIED'] || 0,
      contacted: statusCounts['CONTACTED'] || 0,
      converted: statusCounts['WON'] || 0,
      thisMonth: leadsThisMonth,
      averageScore: Math.round(leadScoreAvg._avg.score || 0),
      byStatus: statusCounts,
    };

    // Fetch project stats
    const [totalProjects, projectsByStatus, totalHoursAgg] = await Promise.all([
      prisma.project.count({ where: { organizationId } }),
      prisma.project.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
      prisma.project.aggregate({
        where: { organizationId },
        _sum: { totalHours: true },
      }),
    ]);

    const projectStatusCounts: Record<string, number> = {};
    projectsByStatus.forEach((item: any) => {
      projectStatusCounts[item.status] = item._count;
    });

    const projectStats = {
      total: totalProjects,
      active: projectStatusCounts['ACTIVE'] || 0,
      completed: projectStatusCounts['COMPLETED'] || 0,
      onHold: projectStatusCounts['ON_HOLD'] || 0,
      totalHoursTracked: totalHoursAgg._sum.totalHours || 0,
      byStatus: projectStatusCounts,
    };

    // Fetch financial stats (invoices)
    const [
      totalInvoices,
      paidRevenue,
      outstandingRevenue,
      unpaidInvoiceCount,
    ] = await Promise.all([
      prisma.invoice.count({ where: { organizationId } }),
      prisma.invoice.aggregate({
        where: { organizationId, status: 'PAID' },
        _sum: { paidAmount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId,
          status: { notIn: ['PAID', 'CANCELLED'] },
        },
        _sum: { total: true, paidAmount: true },
      }),
      prisma.invoice.count({
        where: {
          organizationId,
          status: { notIn: ['PAID', 'CANCELLED'] },
        },
      }),
    ]);

    const totalRevenue = paidRevenue._sum.paidAmount || 0;
    const outstanding = (outstandingRevenue._sum.total || 0) - (outstandingRevenue._sum.paidAmount || 0);

    // Fetch task stats
    const [totalTasks, tasksByStatus] = await Promise.all([
      prisma.task.count({ where: { organizationId } }),
      prisma.task.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: true,
      }),
    ]);

    const taskStatusCounts: Record<string, number> = {};
    tasksByStatus.forEach((item: any) => {
      taskStatusCounts[item.status] = item._count;
    });

    const completedTasks = taskStatusCounts['DONE'] || 0;
    const inProgressTasks = taskStatusCounts['IN_PROGRESS'] || 0;

    // Fetch customer count
    const totalCustomers = await prisma.customer.count({ where: { organizationId } });

    // Fetch meeting stats
    const [totalMeetings, upcomingMeetings] = await Promise.all([
      prisma.meeting.count({ where: { organizationId } }),
      prisma.meeting.count({ where: { organizationId, status: 'UPCOMING' } }),
    ]);

    // Calculate summary metrics
    const conversionRate = leadStats.total > 0
      ? ((leadStats.converted / leadStats.total) * 100).toFixed(1)
      : '0.0';

    const activeProjectsPercentage = projectStats.total > 0
      ? ((projectStats.active / projectStats.total) * 100).toFixed(1)
      : '0.0';

    const collectionRate = (totalRevenue + outstanding) > 0
      ? ((totalRevenue / (totalRevenue + outstanding)) * 100).toFixed(1)
      : '0.0';

    res.json({
      status: 'success',
      data: {
        leads: leadStats,
        projects: projectStats,
        financials: {
          totalRevenue,
          outstandingRevenue: outstanding,
          totalInvoices,
          unpaidInvoiceCount,
          currency: 'EGP', // Default currency
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
        },
        customers: {
          total: totalCustomers,
        },
        meetings: {
          total: totalMeetings,
          upcoming: upcomingMeetings,
        },
        summary: {
          conversionRate,
          activeProjectsPercentage,
          collectionRate,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
