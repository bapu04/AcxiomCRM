import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getDashboardData);

export default router;
