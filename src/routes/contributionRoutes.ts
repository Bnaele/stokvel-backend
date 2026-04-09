import { Router } from 'express';
import { getMyContributions } from '../controllers/contributionController';
import { requireAuth } from '../middleware/requireRole';

const router = Router();

// All routes require authentication
router.get('/my-contributions', requireAuth, getMyContributions);

export default router;
