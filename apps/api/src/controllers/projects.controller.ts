import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';
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

    // Build filter
    const filter: any = { organizationId };
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;
    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Get projects
    const allProjects = await db.findManyProjects(filter);
    const total = allProjects.length;

    // Sort
    const sorted = allProjects.sort((a, b) => {
      if (sortBy === 'name') return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    });

    // Paginate
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const projects = sorted.slice(start, start + limitNum);

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

    const project = await db.findProjectById(id, organizationId);

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
    const project = await db.createProject({
      ...data,
      organizationId,
      createdById: userId,
    });

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'CREATED',
      entityType: 'project',
      entityId: project.id,
      description: `Created new project: ${project.name}`,
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
