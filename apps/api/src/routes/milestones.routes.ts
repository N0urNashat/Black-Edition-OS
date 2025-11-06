import { Router } from 'express';
import { getMilestones, createMilestone } from '../controllers/milestones.controller';

const router = Router();

// Project milestone routes
router.get('/projects/:projectId/milestones', getMilestones);
router.post('/projects/:projectId/milestones', createMilestone);

export default router;
