import { Router } from 'express';
import {
  createPayMobCheckout,
  handlePayMobWebhook,
} from '../controllers/payment.controller';

const router = Router();

/**
 * @route   POST /api/payments/paymob/checkout
 * @desc    Create PayMob checkout session for an invoice
 * @access  Private
 */
router.post('/paymob/checkout', createPayMobCheckout);

/**
 * @route   POST /api/payments/paymob/webhook
 * @desc    Handle PayMob payment webhooks
 * @access  Public (webhook)
 */
router.post('/paymob/webhook', handlePayMobWebhook);

export default router;
