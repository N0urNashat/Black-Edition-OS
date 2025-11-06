import { Request, Response, NextFunction } from 'express';
import { prisma } from '@repo/database';
import axios from 'axios';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * POST /api/payments/paymob/checkout
 * Initiate PayMob payment flow for an invoice
 */
export async function createPayMobCheckout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { invoiceId } = req.body;
    const organizationId = req.headers['x-organization-id'] as string || 'org_black_edition';

    if (!invoiceId) {
      throw new AppError('invoiceId is required', 400);
    }

    // Fetch invoice with customer details
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, organizationId },
      include: {
        customer: true,
        project: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Get organization payment settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        payMobEnabled: true,
        payMobApiKey: true,
        payMobIntegrationId: true,
      },
    });

    if (!organization?.payMobEnabled || !organization.payMobApiKey || !organization.payMobIntegrationId) {
      throw new AppError('PayMob is not configured for this organization', 400);
    }

    // Step 1: Authentication - Get auth token
    logger.info(`PayMob Step 1: Authenticating for invoice ${invoiceId}`);
    const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
      api_key: organization.payMobApiKey,
    });

    const authToken = authResponse.data.token;

    // Step 2: Order Registration
    logger.info(`PayMob Step 2: Registering order for invoice ${invoiceId}`);
    const orderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: Math.round(Number(invoice.total) * 100), // Convert to cents
      currency: invoice.currency || 'EGP',
      merchant_order_id: invoice.invoiceNumber,
      items: [
        {
          name: `Invoice ${invoice.invoiceNumber}`,
          amount_cents: Math.round(Number(invoice.total) * 100),
          description: `Payment for invoice ${invoice.invoiceNumber}`,
          quantity: 1,
        },
      ],
    });

    const orderId = orderResponse.data.id;

    // Step 3: Payment Key Request
    logger.info(`PayMob Step 3: Requesting payment key for invoice ${invoiceId}`);
    const paymentKeyResponse = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
      auth_token: authToken,
      amount_cents: Math.round(Number(invoice.total) * 100),
      expiration: 3600, // 1 hour
      order_id: orderId,
      billing_data: {
        apartment: 'N/A',
        email: invoice.customer.email || 'customer@example.com',
        floor: 'N/A',
        first_name: invoice.customer.name.split(' ')[0] || 'Customer',
        street: 'N/A',
        building: 'N/A',
        phone_number: invoice.customer.phone || '+201000000000',
        shipping_method: 'N/A',
        postal_code: 'N/A',
        city: 'N/A',
        country: 'EG',
        last_name: invoice.customer.name.split(' ').slice(1).join(' ') || 'N/A',
        state: 'N/A',
      },
      currency: invoice.currency || 'EGP',
      integration_id: parseInt(organization.payMobIntegrationId),
    });

    const paymentToken = paymentKeyResponse.data.token;

    // Create pending payment record
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.total,
        method: 'PAYMOB',
        status: 'PENDING',
        gateway: 'paymob',
        metadata: {
          orderId,
          authToken,
          paymentToken,
        },
      },
    });

    logger.info(`PayMob checkout initiated successfully for invoice ${invoiceId}`);

    res.json({
      status: 'success',
      data: {
        paymentToken,
        orderId,
        amount: invoice.total,
        currency: invoice.currency || 'EGP',
        invoiceNumber: invoice.invoiceNumber,
      },
    });
  } catch (error: any) {
    logger.error('PayMob checkout error:', error.response?.data || error.message);

    if (error.response?.data) {
      throw new AppError(`PayMob API Error: ${JSON.stringify(error.response.data)}`, 500);
    }

    next(error);
  }
}

/**
 * POST /api/payments/paymob/webhook
 * Handle PayMob payment webhooks
 */
export async function handlePayMobWebhook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = req.body;

    logger.info('PayMob webhook received:', JSON.stringify(payload));

    // Extract payment details
    const {
      success,
      order,
      amount_cents,
      transaction_id,
    } = payload;

    if (!order?.merchant_order_id) {
      throw new AppError('Invalid webhook payload', 400);
    }

    const invoiceNumber = order.merchant_order_id;

    // Find invoice
    const invoice = await prisma.invoice.findFirst({
      where: { invoiceNumber },
    });

    if (!invoice) {
      logger.warn(`Invoice not found for webhook: ${invoiceNumber}`);
      return res.json({ status: 'error', message: 'Invoice not found' });
    }

    // Update payment status
    if (success === true || success === 'true') {
      const amountPaid = amount_cents / 100;

      await prisma.$transaction([
        // Update invoice
        prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paidAmount: amountPaid,
            paidAt: new Date(),
          },
        }),
        // Update payment record
        prisma.payment.updateMany({
          where: { invoiceId: invoice.id, status: 'PENDING' },
          data: {
            status: 'COMPLETED',
            transactionId: transaction_id,
            paidAt: new Date(),
            metadata: payload,
          },
        }),
      ]);

      logger.info(`Payment completed for invoice ${invoiceNumber}`);
    } else {
      // Payment failed
      await prisma.payment.updateMany({
        where: { invoiceId: invoice.id, status: 'PENDING' },
        data: {
          status: 'FAILED',
          metadata: payload,
        },
      });

      logger.warn(`Payment failed for invoice ${invoiceNumber}`);
    }

    res.json({ status: 'success' });
  } catch (error) {
    logger.error('PayMob webhook error:', error);
    next(error);
  }
}
