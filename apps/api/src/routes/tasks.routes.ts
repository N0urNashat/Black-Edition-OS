import { Router } from 'express';
import { getProjectTasks, createTask, getTaskById, updateTask } from '../controllers/tasks.controller';

const router = Router();

// Project task routes
router.get('/projects/:projectId/tasks', getProjectTasks);
router.post('/projects/:projectId/tasks', createTask);

// Task routes
router.get('/tasks/:id', getTaskById);
router.patch('/tasks/:id', updateTask);

export default router;
