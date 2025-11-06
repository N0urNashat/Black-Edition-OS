import express from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller';

const router = express.Router();

/**
 * Analytics Routes
 */
// GET /api/analytics/dashboard - Get aggregated dashboard analytics
router.get('/analytics/dashboard', getDashboardAnalytics);

export default router;
