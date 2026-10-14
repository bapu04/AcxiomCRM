import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = Router();

router.use(protect);
router.use(authorizeRoles('Admin'));

router.get('/', getAuditLogs);

export default router;
