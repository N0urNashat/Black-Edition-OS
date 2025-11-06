import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * Get all invoices
 * GET /api/invoices
 */
export async function getInvoices(
  req: Request<{}, {}, {}, any>,
  res: Response,
  next: NextFunction
) {
  try {
    const { customerId, status, search } = req.query;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    // Build filter
    const filter: any = { organizationId };
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;
    if (search) filter.search = search;

    const invoices = await db.findManyInvoices(filter);

    res.json({
      status: 'success',
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single invoice by ID
 * GET /api/invoices/:id
 */
export async function getInvoiceById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    const invoice = await db.findInvoiceById(id, organizationId);
    if (!invoice) {
      throw new AppError(404, 'Invoice not found');
    }

    res.json({
      status: 'success',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new invoice
 * POST /api/invoices
 */
export async function createInvoice(
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
      throw new AppError(400, 'Customer is required');
    }
    if (!data.dueDate) {
      throw new AppError(400, 'Due date is required');
    }
    if (!data.lineItems || data.lineItems.length === 0) {
      throw new AppError(400, 'At least one line item is required');
    }

    // Parse dates
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    if (data.issueDate) data.issueDate = new Date(data.issueDate);

    // Create invoice
    const invoice = await db.createInvoice({
      ...data,
      organizationId,
      createdById: userId,
    });

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'CREATED',
      entityType: 'invoice',
      entityId: invoice!.id,
      description: `Created invoice ${invoice!.invoiceNumber}`,
    });

    logger.info(`Invoice created: ${invoice!.id} by user ${userId}`);

    res.status(201).json({
      status: 'success',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
}
