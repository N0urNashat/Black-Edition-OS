import { Router } from 'express';
import { getProjectTimeEntries, createTimeEntry, deleteTimeEntry } from '../controllers/time-tracking.controller';

const router = Router();

// Project time entry routes
router.get('/projects/:projectId/time-entries', getProjectTimeEntries);

// Task time entry routes
router.post('/tasks/:taskId/time-entries', createTimeEntry);

// Time entry routes
router.delete('/time-entries/:id', deleteTimeEntry);

export default router;
