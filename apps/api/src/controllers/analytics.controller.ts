import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';

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

    // Fetch lead stats
    const leadStats = await db.getLeadStats(organizationId);

    // Fetch project stats
    const projectStats = await db.getProjectStats(organizationId);

    // Fetch invoice stats
    const invoices = await db.findManyInvoices({ organizationId });

    const totalRevenue = invoices
      .filter((inv: any) => inv.status === 'PAID')
      .reduce((sum: number, inv: any) => sum + inv.paidAmount, 0);

    const outstandingRevenue = invoices
      .filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
      .reduce((sum: number, inv: any) => sum + (inv.total - inv.paidAmount), 0);

    const unpaidInvoices = invoices.filter((inv: any) =>
      inv.status !== 'PAID' && inv.status !== 'CANCELLED'
    );

    // Get task stats
    const tasks = await db.findManyTasks({ organizationId });
    const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;

    // Get time tracking stats
    const projects = await db.findManyProjects({ organizationId });
    const totalHoursTracked = projects.reduce((sum: number, p: any) => sum + (p.totalHours || 0), 0);

    // Get customer count
    const customers = await db.findManyCustomers({ organizationId });

    // Get meeting stats
    const meetings = await db.findManyMeetings({ organizationId });
    const upcomingMeetings = meetings.filter((m: any) => m.status === 'UPCOMING').length;

    res.json({
      status: 'success',
      data: {
        leads: {
          total: leadStats.total,
          new: leadStats.new,
          qualified: leadStats.qualified,
          contacted: leadStats.contacted,
          converted: leadStats.converted,
          thisMonth: leadStats.thisMonth,
          averageScore: leadStats.averageScore,
          byStatus: leadStats.byStatus,
        },
        projects: {
          total: projectStats.total,
          active: projectStats.active,
          completed: projectStats.completed,
          onHold: projectStats.onHold,
          totalHoursTracked,
          byStatus: projectStats.byStatus,
        },
        financials: {
          totalRevenue,
          outstandingRevenue,
          totalInvoices: invoices.length,
          unpaidInvoiceCount: unpaidInvoices.length,
          currency: 'EGP', // Default currency
        },
        tasks: {
          total: tasks.length,
          completed: completedTasks,
          inProgress: inProgressTasks,
        },
        customers: {
          total: customers.length,
        },
        meetings: {
          total: meetings.length,
          upcoming: upcomingMeetings,
        },
        summary: {
          conversionRate: leadStats.total > 0 ? ((leadStats.converted / leadStats.total) * 100).toFixed(1) : '0.0',
          activeProjectsPercentage: projectStats.total > 0 ? ((projectStats.active / projectStats.total) * 100).toFixed(1) : '0.0',
          collectionRate: (totalRevenue + outstandingRevenue) > 0 ? ((totalRevenue / (totalRevenue + outstandingRevenue)) * 100).toFixed(1) : '0.0',
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
