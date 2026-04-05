import { Router } from 'express';
import { createGroup, getGroups, getGroupById } from '../controllers/groupController';
import { requireAuth } from '../middleware/requireRole';

const router = Router();

// All routes require authentication
router.post('/', requireAuth, createGroup);
router.get('/', requireAuth, getGroups);
router.get('/:id', requireAuth, getGroupById);

export default router;
