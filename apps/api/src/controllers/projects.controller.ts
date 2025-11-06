import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * Get all projects with filters and pagination
 * GET /api/projects
 */
export async function getProjects(
  req: Request<{}, {}, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      page = 1,
      limit = 10,
      customerId,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Build where clause
    const where: any = { organizationId };
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get projects with relations
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          customer: true,
          createdBy: true,
          assignedTo: true,
        },
        skip,
        take: limitNum,
        orderBy: sortBy === 'name'
          ? { name: sortOrder as 'asc' | 'desc' }
          : { createdAt: sortOrder as 'asc' | 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single project by ID
 * GET /api/projects/:id
 */
export async function getProjectById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    const project = await prisma.project.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        customer: true,
        createdBy: true,
        assignedTo: true,
      },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    res.json({
      status: 'success',
      data: project,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new project
 * POST /api/projects
 */
export async function createProject(
  req: Request<{}, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    // Validation
    if (!data.name) {
      throw new AppError(400, 'Project name is required');
    }
    if (!data.customerId) {
      throw new AppError(400, 'Customer ID is required');
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        ...data,
        organizationId,
        createdById: userId,
      },
      include: {
        customer: true,
        createdBy: true,
        assignedTo: true,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        organizationId,
        userId,
        action: 'CREATED',
        entityType: 'project',
        entityId: project.id,
        description: `Created new project: ${project.name}`,
      },
    });

    logger.info(`Project created: ${project.id} by user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: project,
    });
  } catch (error) {
    next(error);
  }
}
