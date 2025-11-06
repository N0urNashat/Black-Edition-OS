import { Request, Response, NextFunction } from 'express';
import { prisma } from '@black-edition/database';
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

    // Get organizationId from authenticated user (would come from auth middleware)
    // For now, using a placeholder - should be replaced with actual auth
    const organizationId = req.headers['x-organization-id'] as string;

    if (!organizationId) {
      throw new AppError(400, 'Organization ID is required');
    }

    // Build where clause
    const where: any = {
      organizationId,
      ...(status && { status }),
      ...(assignedToId && { assignedToId }),
      ...(minScore !== undefined && { score: { gte: minScore } }),
      ...(maxScore !== undefined && { score: { ...(minScore !== undefined && { gte: minScore }), lte: maxScore } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get total count
    const total = await prisma.lead.count({ where });

    // Get leads
    const leads = await prisma.lead.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            activities: true,
            files: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
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
    const organizationId = req.headers['x-organization-id'] as string;

    if (!organizationId) {
      throw new AppError(400, 'Organization ID is required');
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            title: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            title: true,
          },
        },
        customer: true,
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        },
        files: {
          orderBy: {
            createdAt: 'desc',
          },
        },
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
    const organizationId = req.headers['x-organization-id'] as string;
    const userId = req.headers['x-user-id'] as string; // From auth middleware

    if (!organizationId || !userId) {
      throw new AppError(400, 'Organization ID and User ID are required');
    }

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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
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
    const organizationId = req.headers['x-organization-id'] as string;
    const userId = req.headers['x-user-id'] as string;

    if (!organizationId || !userId) {
      throw new AppError(400, 'Organization ID and User ID are required');
    }

    // Check if lead exists
    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId,
      },
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
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
        entityId: lead.id,
        description: `Updated lead: ${changes.join(', ')}`,
        metadata: {
          changes: data,
          previousValues: changes.reduce((acc, key) => ({
            ...acc,
            [key]: existingLead[key as keyof typeof existingLead],
          }), {}),
        },
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
          entityId: lead.id,
          description: `Lead status changed from ${existingLead.status} to ${data.status}`,
          metadata: {
            from: existingLead.status,
            to: data.status,
          },
        },
      });
    }

    logger.info(`Lead updated: ${lead.id} by user ${userId}`);

    res.json({
      status: 'success',
      data: lead,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete lead (soft delete)
 * DELETE /api/leads/:id
 */
export async function deleteLead(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string;
    const userId = req.headers['x-user-id'] as string;

    if (!organizationId || !userId) {
      throw new AppError(400, 'Organization ID and User ID are required');
    }

    // Check if lead exists
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    // Soft delete by setting status to LOST or actually delete
    // For now, we'll actually delete (can be changed to soft delete)
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
    const organizationId = req.headers['x-organization-id'] as string;

    if (!organizationId) {
      throw new AppError(400, 'Organization ID is required');
    }

    // Get counts by status
    const statusCounts = await prisma.lead.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: true,
    });

    // Get average score
    const avgScore = await prisma.lead.aggregate({
      where: { organizationId },
      _avg: { score: true },
    });

    // Get total leads
    const total = await prisma.lead.count({
      where: { organizationId },
    });

    // Get leads created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await prisma.lead.count({
      where: {
        organizationId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    res.json({
      status: 'success',
      data: {
        total,
        thisMonth,
        averageScore: Math.round(avgScore._avg.score || 0),
        byStatus: statusCounts.reduce((acc, item) => ({
          ...acc,
          [item.status]: item._count,
        }), {}),
      },
    });
  } catch (error) {
    next(error);
  }
}
