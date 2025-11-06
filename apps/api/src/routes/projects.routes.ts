import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
} from '../controllers/projects.controller';

const router = Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects with filters and pagination
 * @access  Private
 */
router.get('/', getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
router.get('/:id', getProjectById);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private
 */
router.post('/', createProject);

export default router;
