import express from 'express';
import {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
} from '../controllers/workflows.controller';

const router = express.Router();

/**
 * Workflows Routes
 */
// GET /api/workflows - Get all workflows
router.get('/workflows', getWorkflows);

// GET /api/workflows/:id - Get a specific workflow
router.get('/workflows/:id', getWorkflowById);

// POST /api/workflows - Create a new workflow
router.post('/workflows', createWorkflow);

// PATCH /api/workflows/:id - Update a workflow
router.patch('/workflows/:id', updateWorkflow);

export default router;
