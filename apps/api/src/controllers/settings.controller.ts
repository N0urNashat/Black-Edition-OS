import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
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

    // Get organization with settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    // Extract payment settings from organization settings
    const settings = organization?.settings as any;
    const paymentSettings = settings?.paymentSettings || {
      payMobEnabled: false,
      payMobApiKey: '',
      payMobIntegrationId: '',
      payMobHmacSecret: '',
      instapayEnabled: false,
      instapayLink: '',
      bankTransferEnabled: false,
      bankDetails: '',
    };

    res.json({
      status: 'success',
      data: paymentSettings,
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

    // Get current settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });

    const currentSettings = (organization?.settings as any) || {};
    const currentPaymentSettings = currentSettings.paymentSettings || {};

    // Merge new payment settings with existing ones
    const updatedPaymentSettings = {
      ...currentPaymentSettings,
      ...data,
    };

    // Update organization settings
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        settings: {
          ...currentSettings,
          paymentSettings: updatedPaymentSettings,
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        organizationId,
        userId,
        action: 'UPDATED',
        entityType: 'payment_settings',
        entityId: organizationId,
        description: 'Updated payment settings',
      },
    });

    logger.info(`Payment settings updated for org ${organizationId} by user ${userId}`);

    res.json({
      status: 'success',
      data: updatedPaymentSettings,
    });
  } catch (error) {
    next(error);
  }
}
