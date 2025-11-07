import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
import { AppError } from '../middleware/error-handler';

/**
 * Get all customers with filters and pagination
 * GET /api/customers
 */
export async function getCustomers(
  req: Request<{}, {}, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      page = 1,
      limit = 10,
      assignedToId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Build filter
    const where: any = { organizationId };
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.customer.count({ where });

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Get customers with relations
    const customers = await prisma.customer.findMany({
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
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });

    res.json({
      status: 'success',
      data: customers,
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
 * Get single customer by ID
 * GET /api/customers/:id
 */
export async function getCustomerById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    const customer = await prisma.customer.findFirst({
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

    if (!customer) {
      throw new AppError(404, 'Customer not found');
    }

    res.json({
      status: 'success',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
}
