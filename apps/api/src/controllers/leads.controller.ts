import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
import { CreateLeadInput, UpdateLeadInput, GetLeadsQuery } from '../validators/leads.validator';
import { calculateLeadScore } from '../utils/lead-scoring';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * Get all leads with filters and pagination
 * GET /api/leads
 */
export async function getLeads(
  req: Request<{}, {}, {}, GetLeadsQuery>,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      assignedToId,
      minScore,
      maxScore,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Build filter
    const where: any = { organizationId };
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;
    if (minScore !== undefined || maxScore !== undefined) {
      where.score = {};
      if (minScore !== undefined) where.score.gte = minScore;
      if (maxScore !== undefined) where.score.lte = maxScore;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by
    const orderBy: any = {};
    if (sortBy === 'score') orderBy.score = sortOrder;
    else if (sortBy === 'name') orderBy.name = sortOrder;
    else orderBy.createdAt = sortOrder;

    // Get total count
    const total = await prisma.lead.count({ where });

    // Get leads with pagination
    const leads = await prisma.lead.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json({
      status: 'success',
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single lead by ID
 * GET /api/leads/:id
 */
export async function getLeadById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    const lead = await prisma.lead.findFirst({
      where: { id, organizationId },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    res.json({
      status: 'success',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new lead
 * POST /api/leads
 */
export async function createLead(
  req: Request<{}, {}, CreateLeadInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_2';

    // Calculate lead score
    const score = calculateLeadScore(data);

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        ...data,
        organizationId,
        createdById: userId,
        score,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        organizationId,
        userId,
        action: 'CREATED',
        entityType: 'lead',
        entityId: lead.id,
        description: `Created new lead: ${lead.name}${lead.company ? ` from ${lead.company}` : ''}`,
      },
    });

    logger.info(`Lead created: ${lead.id} by user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update lead
 * PATCH /api/leads/:id
 */
export async function updateLead(
  req: Request<{ id: string }, {}, UpdateLeadInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_2';

    // Check if lead exists
    const existingLead = await prisma.lead.findFirst({
      where: { id, organizationId },
    });

    if (!existingLead) {
      throw new AppError(404, 'Lead not found');
    }

    // Recalculate score if relevant fields changed
    const updatedData = { ...existingLead, ...data };
    const score = calculateLeadScore(updatedData);

    // Update lead
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        score,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    // Create activity log
    const changes = Object.keys(data);
    await prisma.activity.create({
      data: {
        organizationId,
        userId,
        action: 'UPDATED',
        entityType: 'lead',
        entityId: id,
        description: `Updated lead: ${changes.join(', ')}`,
        metadata: { changes: data },
      },
    });

    // Log status change separately if status changed
    if (data.status && data.status !== existingLead.status) {
      await prisma.activity.create({
        data: {
          organizationId,
          userId,
          action: 'STATUS_CHANGED',
          entityType: 'lead',
          entityId: id,
          description: `Lead status changed from ${existingLead.status} to ${data.status}`,
          metadata: { from: existingLead.status, to: data.status },
        },
      });
    }

    logger.info(`Lead updated: ${id} by user ${userId}`);

    res.json({
      status: 'success',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete lead
 * DELETE /api/leads/:id
 */
export async function deleteLead(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_2';

    // Check if lead exists
    const lead = await prisma.lead.findFirst({
      where: { id, organizationId },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    // Delete lead
    await prisma.lead.delete({
      where: { id },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        organizationId,
        userId,
        action: 'DELETED',
        entityType: 'lead',
        entityId: id,
        description: `Deleted lead: ${lead.name}${lead.company ? ` from ${lead.company}` : ''}`,
      },
    });

    logger.info(`Lead deleted: ${id} by user ${userId}`);

    res.json({
      status: 'success',
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get lead statistics
 * GET /api/leads/stats
 */
export async function getLeadStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Get total leads
    const totalLeads = await prisma.lead.count({
      where: { organizationId },
    });

    // Get leads by status
    const leadsByStatus = await prisma.lead.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
    });

    // Calculate status counts
    const statusCounts: Record<string, number> = {};
    leadsByStatus.forEach((item: any) => {
      statusCounts[item.status] = item._count;
    });

    // Get average score
    const scoreAggregate = await prisma.lead.aggregate({
      where: { organizationId },
      _avg: { score: true },
    });

    // Get leads created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthCount = await prisma.lead.count({
      where: {
        organizationId,
        createdAt: { gte: startOfMonth },
      },
    });

    const stats = {
      total: totalLeads,
      new: statusCounts['NEW'] || 0,
      qualified: statusCounts['QUALIFIED'] || 0,
      contacted: statusCounts['CONTACTED'] || 0,
      converted: statusCounts['WON'] || 0,
      thisMonth: thisMonthCount,
      averageScore: Math.round(scoreAggregate._avg.score || 0),
      byStatus: statusCounts,
    };

    res.json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Convert lead to customer
 * POST /api/leads/:id/convert
 */
export async function convertLeadToCustomer(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_2';

    // Check if lead exists
    const lead = await prisma.lead.findFirst({
      where: { id, organizationId },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    // Check if already converted
    if (lead.status === 'WON' || lead.customerId) {
      throw new AppError(400, 'Lead has already been converted to customer');
    }

    // Use transaction to create customer and update lead
    const result = await prisma.$transaction(async (tx) => {
      // Create customer from lead data
      const customer = await tx.customer.create({
        data: {
          organizationId,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          website: lead.website,
          notes: lead.notes,
          createdById: userId,
          assignedToId: lead.assignedToId,
          leadId: id,
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });

      // Update lead status to WON and link to customer
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: 'WON',
          convertedAt: new Date(),
          customerId: customer.id,
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });

      // Create activity log for lead
      await tx.activity.create({
        data: {
          organizationId,
          userId,
          action: 'CONVERTED',
          entityType: 'lead',
          entityId: id,
          description: `Converted lead to customer: ${lead.name}${lead.company ? ` from ${lead.company}` : ''}`,
        },
      });

      // Create activity log for customer
      await tx.activity.create({
        data: {
          organizationId,
          userId,
          action: 'CREATED',
          entityType: 'customer',
          entityId: customer.id,
          description: `Customer created from lead: ${customer.name}${customer.company ? ` from ${customer.company}` : ''}`,
        },
      });

      return { lead: updatedLead, customer };
    });

    logger.info(`Lead converted to customer: ${id} -> ${result.customer.id} by user ${userId}`);

    res.json({
      status: 'success',
      message: 'Lead converted to customer successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
