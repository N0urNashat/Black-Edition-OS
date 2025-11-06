import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * Get meetings for client (filtered by customer)
 * GET /api/meetings
 */
export async function getMeetings(
  req: Request<{}, {}, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const { customerId, status } = req.query;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Build filter
    const filter: any = { organizationId };
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;

    const meetings = await prisma.meeting.findMany({
      where: filter,
      include: {
        customer: true,
        project: true,
      },
    });

    res.json({
      status: 'success',
      data: meetings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Client requests a new meeting
 * POST /api/meetings/request
 */
export async function requestMeeting(
  req: Request<{}, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    // Validation
    if (!data.customerId) {
      throw new AppError(400, 'Customer ID is required');
    }
    if (!data.title) {
      throw new AppError(400, 'Meeting title is required');
    }
    if (!data.startTime) {
      throw new AppError(400, 'Start time is required');
    }
    if (!data.endTime) {
      throw new AppError(400, 'End time is required');
    }

    // Parse dates
    const meetingData: any = {
      ...data,
      organizationId,
      requestedById: userId,
      status: 'UPCOMING',
    };
    if (data.startTime) meetingData.startTime = new Date(data.startTime);
    if (data.endTime) meetingData.endTime = new Date(data.endTime);

    // Create meeting
    const meeting = await prisma.meeting.create({
      data: meetingData,
      include: {
        customer: true,
        project: true,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        organizationId,
        userId,
        action: 'CREATED',
        entityType: 'meeting',
        entityId: meeting.id,
        description: `Requested meeting: ${meeting.title}`,
      },
    });

    logger.info(`Meeting requested: ${meeting.id} by user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Agency creates a meeting for a project
 * POST /api/projects/:projectId/meetings
 */
export async function createProjectMeeting(
  req: Request<{ projectId: string }, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    // Verify project exists
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });
    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    // Validation
    if (!data.title) {
      throw new AppError(400, 'Meeting title is required');
    }
    if (!data.startTime) {
      throw new AppError(400, 'Start time is required');
    }
    if (!data.endTime) {
      throw new AppError(400, 'End time is required');
    }

    // Parse dates
    const meetingData: any = {
      ...data,
      organizationId,
      projectId,
      customerId: project.customerId,
      status: 'UPCOMING',
    };
    if (data.startTime) meetingData.startTime = new Date(data.startTime);
    if (data.endTime) meetingData.endTime = new Date(data.endTime);

    // Create meeting
    const meeting = await prisma.meeting.create({
      data: meetingData,
      include: {
        customer: true,
        project: true,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        organizationId,
        userId,
        action: 'CREATED',
        entityType: 'meeting',
        entityId: meeting.id,
        description: `Created meeting: ${meeting.title}`,
      },
    });

    logger.info(`Meeting created: ${meeting.id} by user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: meeting,
    });
  } catch (error) {
    next(error);
  }
}
