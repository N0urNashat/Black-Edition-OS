import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * Get all milestones for a project
 * GET /api/projects/:projectId/milestones
 */
export async function getMilestones(
  req: Request<{ projectId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Verify project exists and belongs to organization
    const project = await db.findProjectById(projectId, organizationId);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Get milestones
    const milestones = await db.findManyMilestones({ projectId });

    res.json({
      status: 'success',
      data: milestones,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new milestone for a project
 * POST /api/projects/:projectId/milestones
 */
export async function createMilestone(
  req: Request<{ projectId: string }, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    // Verify project exists and belongs to organization
    const project = await db.findProjectById(projectId, organizationId);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Validation
    if (!data.name) {
      throw new AppError(400, 'Milestone name is required');
    }
    if (!data.dueDate) {
      throw new AppError(400, 'Due date is required');
    }

    // Create milestone
    const milestone = await db.createMilestone({
      ...data,
      projectId,
      dueDate: new Date(data.dueDate),
    });

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'CREATED',
      entityType: 'milestone',
      entityId: milestone.id,
      description: `Created milestone: ${milestone.name}`,
    });

    logger.info(`Milestone created: ${milestone.id} by user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
}
