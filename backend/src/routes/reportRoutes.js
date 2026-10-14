import { Router } from 'express';
import {
  getPipelineReport,
  getConversionReport,
  getUserActivityReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';

const router = Router();

router.use(protect);

router.get('/pipeline', getPipelineReport);
router.get('/conversion', getConversionReport);
router.get('/user-activity', authorizeRoles('Admin', 'Manager'), getUserActivityReport);

export default router;
