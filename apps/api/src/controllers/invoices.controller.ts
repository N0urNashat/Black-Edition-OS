import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
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
    const where: any = { organizationId };
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, company: true } },
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { issueDate: 'desc' },
    });

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

    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId },
      include: {
        customer: { select: { id: true, name: true, email: true, company: true } },
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        lineItems: { orderBy: { position: 'asc' } },
      },
    });

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
    const dueDate = new Date(data.dueDate);
    const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { organizationId },
    });
    const invoiceNumber = data.invoiceNumber || `INV-${String(invoiceCount + 1).padStart(5, '0')}`;

    // Use transaction to create invoice and line items atomically
    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice
      const createdInvoice = await tx.invoice.create({
        data: {
          organizationId,
          customerId: data.customerId,
          projectId: data.projectId || null,
          invoiceNumber,
          status: data.status || 'DRAFT',
          issueDate,
          dueDate,
          subtotal: data.subtotal,
          taxRate: data.taxRate || 0,
          taxAmount: data.taxAmount || 0,
          discount: data.discount || 0,
          total: data.total,
          paidAmount: 0,
          currency: data.currency || 'EGP',
          notes: data.notes || null,
          terms: data.terms || null,
          recurring: data.recurring || false,
          recurringInterval: data.recurringInterval || null,
          createdById: userId,
        },
      });

      // Create line items
      const lineItemsData = data.lineItems.map((item: any, index: number) => ({
        invoiceId: createdInvoice.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        taxable: item.taxable !== false,
        position: index,
      }));

      await tx.invoiceLineItem.createMany({
        data: lineItemsData,
      });

      // Fetch the complete invoice with relations
      const completeInvoice = await tx.invoice.findUnique({
        where: { id: createdInvoice.id },
        include: {
          customer: { select: { id: true, name: true, email: true, company: true } },
          project: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, email: true, avatar: true } },
          lineItems: { orderBy: { position: 'asc' } },
        },
      });

      // Create activity log
      await tx.activity.create({
        data: {
          organizationId,
          userId,
          action: 'CREATED',
          entityType: 'invoice',
          entityId: createdInvoice.id,
          description: `Created invoice ${invoiceNumber}`,
        },
      });

      return completeInvoice;
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
