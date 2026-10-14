import { Router } from 'express';
import { body } from 'express-validator';
import { getActivities, createActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

router.use(protect);

router
  .route('/')
  .get(getActivities)
  .post(
    [
      body('activityType').notEmpty().withMessage('Activity type is required.'),
      body('subject').trim().notEmpty().withMessage('Subject is required.'),
    ],
    validateRequest,
    createActivity
  );

export default router;
