import express from 'express';
import {
  generateProposal,
  generateReportInsights,
  aiSearch,
} from '../controllers/ai.controller';

const router = express.Router();

/**
 * AI Routes
 */
// POST /api/ai/generate-proposal - Generate AI proposal for a lead
router.post('/ai/generate-proposal', generateProposal);

// POST /api/ai/generate-report-insights - Generate AI insights from data
router.post('/ai/generate-report-insights', generateReportInsights);

// POST /api/ai/search - Natural language search
router.post('/ai/search', aiSearch);

export default router;
