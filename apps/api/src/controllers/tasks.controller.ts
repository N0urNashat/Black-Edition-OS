import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * Get all tasks for a project
 * GET /api/projects/:projectId/tasks
 */
export async function getProjectTasks(
  req: Request<{ projectId: string }, {}, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const { status } = req.query;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Verify project exists and belongs to organization
    const project = await db.findProjectById(projectId, organizationId);
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Build filter
    const filter: any = { projectId };
    if (status) filter.status = status;

    // Get tasks
    const tasks = await db.findManyTasks(filter);

    res.json({
      status: 'success',
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new task for a project
 * POST /api/projects/:projectId/tasks
 */
export async function createTask(
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
    if (!data.title) {
      throw new AppError(400, 'Task title is required');
    }

    // Parse dates if provided
    const taskData: any = {
      ...data,
      projectId,
    };
    if (data.dueDate) taskData.dueDate = new Date(data.dueDate);
    if (data.startDate) taskData.startDate = new Date(data.startDate);

    // Create task
    const task = await db.createTask(taskData);

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'CREATED',
      entityType: 'task',
      entityId: task.id,
      description: `Created task: ${task.title}`,
    });

    logger.info(`Task created: ${task.id} by user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single task by ID
 * GET /api/tasks/:id
 */
export async function getTaskById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    const task = await db.findTaskById(id);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    res.json({
      status: 'success',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update task
 * PATCH /api/tasks/:id
 */
export async function updateTask(
  req: Request<{ id: string }, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    // Parse dates if provided
    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.startDate) updateData.startDate = new Date(data.startDate);

    // Update task
    const task = await db.updateTask(id, updateData);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'UPDATED',
      entityType: 'task',
      entityId: task.id,
      description: `Updated task: ${task.title}`,
    });

    logger.info(`Task updated: ${task.id} by user ${userId}`);

    res.json({
      status: 'success',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}
