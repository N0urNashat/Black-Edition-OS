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

    // Get organization with payment settings fields
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        payMobEnabled: true,
        payMobApiKey: true,
        payMobIntegrationId: true,
        payMobHmacSecret: true,
        instapayEnabled: true,
        instapayLink: true,
        bankTransferEnabled: true,
        bankDetails: true,
      },
    });

    if (!organization) {
      throw new AppError(404, 'Organization not found');
    }

    res.json({
      status: 'success',
      data: {
        payMobEnabled: organization.payMobEnabled,
        payMobApiKey: organization.payMobApiKey || '',
        payMobIntegrationId: organization.payMobIntegrationId || '',
        payMobHmacSecret: organization.payMobHmacSecret || '',
        instapayEnabled: organization.instapayEnabled,
        instapayLink: organization.instapayLink || '',
        bankTransferEnabled: organization.bankTransferEnabled,
        bankDetails: organization.bankDetails || '',
      },
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

    // Build update data object with only provided fields
    const updateData: any = {};
    if (data.payMobEnabled !== undefined) updateData.payMobEnabled = data.payMobEnabled;
    if (data.payMobApiKey !== undefined) updateData.payMobApiKey = data.payMobApiKey;
    if (data.payMobIntegrationId !== undefined) updateData.payMobIntegrationId = data.payMobIntegrationId;
    if (data.payMobHmacSecret !== undefined) updateData.payMobHmacSecret = data.payMobHmacSecret;
    if (data.instapayEnabled !== undefined) updateData.instapayEnabled = data.instapayEnabled;
    if (data.instapayLink !== undefined) updateData.instapayLink = data.instapayLink;
    if (data.bankTransferEnabled !== undefined) updateData.bankTransferEnabled = data.bankTransferEnabled;
    if (data.bankDetails !== undefined) updateData.bankDetails = data.bankDetails;

    // Update organization payment settings
    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
      select: {
        payMobEnabled: true,
        payMobApiKey: true,
        payMobIntegrationId: true,
        payMobHmacSecret: true,
        instapayEnabled: true,
        instapayLink: true,
        bankTransferEnabled: true,
        bankDetails: true,
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
      data: {
        payMobEnabled: updatedOrg.payMobEnabled,
        payMobApiKey: updatedOrg.payMobApiKey || '',
        payMobIntegrationId: updatedOrg.payMobIntegrationId || '',
        payMobHmacSecret: updatedOrg.payMobHmacSecret || '',
        instapayEnabled: updatedOrg.instapayEnabled,
        instapayLink: updatedOrg.instapayLink || '',
        bankTransferEnabled: updatedOrg.bankTransferEnabled,
        bankDetails: updatedOrg.bankDetails || '',
      },
    });
  } catch (error) {
    next(error);
  }
}
