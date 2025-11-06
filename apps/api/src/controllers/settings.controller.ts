import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/in-memory-db';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * Get payment settings for organization
 * GET /api/settings/payment
 */
export async function getPaymentSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    const settings = await db.getPaymentSettings(organizationId);

    res.json({
      status: 'success',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update payment settings for organization
 * POST /api/settings/payment
 */
export async function updatePaymentSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';
    const userId = req.headers['x-user-id'] as string || 'user_1';

    const settings = await db.updatePaymentSettings(organizationId, data);

    // Create activity log
    await db.createActivity({
      organizationId,
      userId,
      action: 'UPDATED',
      entityType: 'payment_settings',
      entityId: organizationId,
      description: 'Updated payment settings',
    });

    logger.info(`Payment settings updated for org ${organizationId} by user ${userId}`);

    res.json({
      status: 'success',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}
