import express from 'express';
import {
  getReports,
  getReportById,
  createReport,
} from '../controllers/reports.controller';

const router = express.Router();

/**
 * Reports Routes
 */
// GET /api/reports - Get all reports
router.get('/reports', getReports);

// GET /api/reports/:id - Get a specific report
router.get('/reports/:id', getReportById);

// POST /api/reports - Create a new report
router.post('/reports', createReport);

export default router;
