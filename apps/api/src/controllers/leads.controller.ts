import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';
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
    const filter: any = { organizationId };
    if (status) filter.status = status;
    if (assignedToId) filter.assignedToId = assignedToId;
    if (minScore !== undefined || maxScore !== undefined) {
      filter.score = {};
      if (minScore !== undefined) filter.score.gte = minScore;
      if (maxScore !== undefined) filter.score.lte = maxScore;
    }
    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Get leads
    const allLeads = await db.findManyLeads(filter);
    const total = allLeads.length;

    // Sort
    const sorted = allLeads.sort((a, b) => {
      if (sortBy === 'score') return sortOrder === 'asc' ? a.score - b.score : b.score - a.score;
      if (sortBy === 'name') return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    });

    // Paginate
    const start = (page - 1) * limit;
    const leads = sorted.slice(start, start + limit);

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

    const lead = await db.findLeadById(id, organizationId);

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
    const lead = await db.createLead({
      ...data,
      organizationId,
      createdById: userId,
      score,
    });

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'CREATED',
      entityType: 'lead',
      entityId: lead.id,
      description: `Created new lead: ${lead.name}${lead.company ? ` from ${lead.company}` : ''}`,
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
    const existingLead = await db.findLeadById(id, organizationId);

    if (!existingLead) {
      throw new AppError(404, 'Lead not found');
    }

    // Recalculate score if relevant fields changed
    const updatedData = { ...existingLead, ...data };
    const score = calculateLeadScore(updatedData);

    // Update lead
    const lead = await db.updateLead(id, {
      ...data,
      score,
    });

    // Create activity log
    const changes = Object.keys(data);
    await db.createActivity({
      organizationId,
      userId,
      action: 'UPDATED',
      entityType: 'lead',
      entityId: id,
      description: `Updated lead: ${changes.join(', ')}`,
      metadata: { changes: data },
    });

    // Log status change separately if status changed
    if (data.status && data.status !== existingLead.status) {
      await db.createActivity({
        organizationId,
        userId,
        action: 'STATUS_CHANGED',
        entityType: 'lead',
        entityId: id,
        description: `Lead status changed from ${existingLead.status} to ${data.status}`,
        metadata: { from: existingLead.status, to: data.status },
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
    const lead = await db.findLeadById(id, organizationId);

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    // Delete lead
    await db.deleteLead(id);

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'DELETED',
      entityType: 'lead',
      entityId: id,
      description: `Deleted lead: ${lead.name}${lead.company ? ` from ${lead.company}` : ''}`,
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

    const stats = await db.getLeadStats(organizationId);

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
    const lead = await db.findLeadById(id, organizationId);

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    // Check if already converted
    if (lead.status === 'WON' || lead.customerId) {
      throw new AppError(400, 'Lead has already been converted to customer');
    }

    // Update lead status to WON
    const updatedLead = await db.updateLead(id, {
      status: 'WON',
      convertedAt: new Date(),
    });

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'CONVERTED',
      entityType: 'lead',
      entityId: id,
      description: `Converted lead to customer: ${lead.name}${lead.company ? ` from ${lead.company}` : ''}`,
    });

    logger.info(`Lead converted to customer: ${id} by user ${userId}`);

    res.json({
      status: 'success',
      message: 'Lead converted to customer successfully',
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
}
