import { Router } from 'express';
import { body } from 'express-validator';
import {
  getFollowUps,
  getFollowUpById,
  createFollowUp,
  updateFollowUp,
  completeFollowUp,
  deleteFollowUp,
} from '../controllers/followUpController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const followUpValidation = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Follow-up subject is required.')
    .isLength({ max: 150 })
    .withMessage('Subject cannot exceed 150 characters.'),
  body('followUpDate')
    .notEmpty()
    .withMessage('Follow-up date is required.')
    .isISO8601()
    .withMessage('Enter a valid date for Follow-up date.'),
  body('followUpType')
    .optional()
    .isIn(['Call', 'Meeting', 'Email', 'Task'])
    .withMessage('Follow-up type must be Call, Meeting, Email, or Task.'),
];

router.use(protect);

router
  .route('/')
  .get(getFollowUps)
  .post(followUpValidation, validateRequest, createFollowUp);

router.patch('/:id/complete', completeFollowUp);

router
  .route('/:id')
  .get(getFollowUpById)
  .put(followUpValidation, validateRequest, updateFollowUp)
  .delete(authorizeRoles('Admin', 'Manager'), deleteFollowUp);

export default router;
