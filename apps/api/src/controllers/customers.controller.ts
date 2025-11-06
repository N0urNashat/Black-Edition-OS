import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

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
    const filter: any = { organizationId };
    if (assignedToId) filter.assignedToId = assignedToId;
    if (search) {
      filter.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Get customers
    const allCustomers = await db.findManyCustomers(filter);
    const total = allCustomers.length;

    // Sort
    const sorted = allCustomers.sort((a, b) => {
      if (sortBy === 'name') return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
    });

    // Paginate
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const customers = sorted.slice(start, start + limitNum);

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

    const customer = await db.findCustomerById(id, organizationId);

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
