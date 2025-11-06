import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
} from '../controllers/customers.controller';

const router = Router();

/**
 * @route   GET /api/customers
 * @desc    Get all customers with filters and pagination
 * @access  Private
 */
router.get('/', getCustomers);

/**
 * @route   GET /api/customers/:id
 * @desc    Get single customer by ID
 * @access  Private
 */
router.get('/:id', getCustomerById);

export default router;
