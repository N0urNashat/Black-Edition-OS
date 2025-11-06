import { Router } from 'express';
import { getPaymentSettings, updatePaymentSettings } from '../controllers/settings.controller';

const router = Router();

// Payment settings routes
router.get('/settings/payment', getPaymentSettings);
router.post('/settings/payment', updatePaymentSettings);

export default router;
