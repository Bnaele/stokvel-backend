import { Router } from 'express';
import { getUserContributions } from '../controllers/contributionController';
import { requireAuth } from '../middleware/requireRole';

const router = Router();

router.get('/', requireAuth, getUserContributions);

export default router;
