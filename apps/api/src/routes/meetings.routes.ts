import express from 'express';
import {
  getMeetings,
  requestMeeting,
  createProjectMeeting,
} from '../controllers/meetings.controller';

const router = express.Router();

/**
 * Client Routes
 */
// GET /api/meetings - Client views their meetings
router.get('/meetings', getMeetings);

// POST /api/meetings/request - Client requests a meeting
router.post('/meetings/request', requestMeeting);

/**
 * Agency Routes
 */
// POST /api/projects/:projectId/meetings - Agency creates meeting for project
router.post('/projects/:projectId/meetings', createProjectMeeting);

export default router;
