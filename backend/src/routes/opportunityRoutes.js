import { Router } from 'express';
import { body } from 'express-validator';
import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../controllers/opportunityController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const opportunityValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Opportunity Name is required.')
    .isLength({ max: 150 })
    .withMessage('Opportunity Name cannot exceed 150 characters.'),
  body('customerId')
    .notEmpty()
    .withMessage('Customer selection is required.'),
  body('amount')
    .notEmpty()
    .withMessage('Opportunity Amount is required.')
    .isFloat({ min: 0.01 })
    .withMessage('Opportunity Amount must be greater than 0.'),
  body('stage')
    .optional()
    .isIn(['Qualification', 'Proposal', 'Negotiation', 'Won', 'Lost'])
    .withMessage('Invalid pipeline stage.'),
  body('probability')
    .notEmpty()
    .withMessage('Probability is required.')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100.'),
  body('expectedCloseDate')
    .notEmpty()
    .withMessage('Expected Close Date is required.')
    .isISO8601()
    .withMessage('Enter a valid date for Expected Close Date.'),
];

router.use(protect);

router
  .route('/')
  .get(getOpportunities)
  .post(opportunityValidation, validateRequest, createOpportunity);

router
  .route('/:id')
  .get(getOpportunityById)
  .put(opportunityValidation, validateRequest, updateOpportunity)
  .delete(authorizeRoles('Admin', 'Manager'), deleteOpportunity);

export default router;
