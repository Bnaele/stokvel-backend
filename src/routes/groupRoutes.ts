import { Router } from 'express';
import { createGroup, getGroups, getGroupById } from '../controllers/groupController';
import { requireAuth, requireGlobalAdmin } from '../middleware/requireRole';

const router = Router();

router.post('/', requireAuth, requireGlobalAdmin(), createGroup);
router.get('/', requireAuth, getGroups);
router.get('/:id', requireAuth, getGroupById);

export default router;
