import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * Get all time entries for a project
 * GET /api/projects/:projectId/time-entries
 */
export async function getProjectTimeEntries(
  req: Request<{ projectId: string }, {}, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Verify project exists and belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Get time entries
    const timeEntries = await prisma.timeEntry.findMany({
      where: { projectId },
    });

    res.json({
      status: 'success',
      data: timeEntries,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new time entry for a task
 * POST /api/tasks/:taskId/time-entries
 */
export async function createTimeEntry(
  req: Request<{ taskId: string }, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    // Validation
    if (!data.duration || data.duration <= 0) {
      throw new AppError(400, 'Duration must be a positive number');
    }

    // Parse date if provided
    const timeEntryData: any = {
      ...data,
      taskId,
      projectId: task.projectId,
      userId,
    };
    if (data.date) timeEntryData.date = new Date(data.date);

    // Create time entry and update task/project in a transaction
    const timeEntry = await prisma.$transaction(async (tx) => {
      // Create time entry
      const entry = await tx.timeEntry.create({
        data: timeEntryData,
      });

      // Update task actualTime
      await tx.task.update({
        where: { id: taskId },
        data: {
          actualTime: {
            increment: data.duration,
          },
        },
      });

      // Update project actualHours
      await tx.project.update({
        where: { id: task.projectId },
        data: {
          actualHours: {
            increment: data.duration,
          },
        },
      });

      return entry;
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        organizationId,
        userId,
        action: 'CREATED',
        entityType: 'time_entry',
        entityId: timeEntry.id,
        description: `Logged ${timeEntry.duration} hours on task: ${task.title}`,
      },
    });

    logger.info(`Time entry created: ${timeEntry.id} by user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: timeEntry,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete time entry
 * DELETE /api/time-entries/:id
 */
export async function deleteTimeEntry(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    // Find time entry first to get the data before deletion
    const existingEntry = await prisma.timeEntry.findUnique({
      where: { id },
    });
    if (!existingEntry) {
      throw new AppError(404, 'Time entry not found');
    }

    // Delete time entry and update task/project in a transaction
    const timeEntry = await prisma.$transaction(async (tx) => {
      // Delete time entry
      const entry = await tx.timeEntry.delete({
        where: { id },
      });

      // Update task actualTime (decrement)
      await tx.task.update({
        where: { id: entry.taskId },
        data: {
          actualTime: {
            decrement: entry.duration,
          },
        },
      });

      // Update project actualHours (decrement)
      await tx.project.update({
        where: { id: entry.projectId },
        data: {
          actualHours: {
            decrement: entry.duration,
          },
        },
      });

      return entry;
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        organizationId,
        userId,
        action: 'DELETED',
        entityType: 'time_entry',
        entityId: timeEntry.id,
        description: `Deleted time entry: ${timeEntry.duration} hours`,
      },
    });

    logger.info(`Time entry deleted: ${id} by user ${userId}`);

    res.json({
      status: 'success',
      message: 'Time entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
