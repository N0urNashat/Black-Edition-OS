import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getLeadStats,
  convertLeadToCustomer,
} from '../controllers/leads.controller';
import { validate } from '../middleware/validate';
import {
  createLeadSchema,
  updateLeadSchema,
  getLeadsSchema,
  leadIdSchema,
} from '../validators/leads.validator';

const router = Router();

/**
 * @route   GET /api/leads/stats
 * @desc    Get lead statistics
 * @access  Private
 */
router.get('/stats', getLeadStats);

/**
 * @route   GET /api/leads
 * @desc    Get all leads with filters and pagination
 * @access  Private
 */
router.get('/', validate(getLeadsSchema) as any, getLeads);

/**
 * @route   POST /api/leads/:id/convert
 * @desc    Convert lead to customer
 * @access  Private
 */
router.post('/:id/convert', validate(leadIdSchema), convertLeadToCustomer);

/**
 * @route   GET /api/leads/:id
 * @desc    Get single lead by ID
 * @access  Private
 */
router.get('/:id', validate(leadIdSchema), getLeadById);

/**
 * @route   POST /api/leads
 * @desc    Create new lead
 * @access  Private
 */
router.post('/', validate(createLeadSchema), createLead);

/**
 * @route   PATCH /api/leads/:id
 * @desc    Update lead
 * @access  Private
 */
router.patch('/:id', validate(leadIdSchema), validate(updateLeadSchema), updateLead);

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete lead
 * @access  Private
 */
router.delete('/:id', validate(leadIdSchema), deleteLead);

export default router;
