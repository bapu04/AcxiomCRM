import { Router } from 'express';
import { body } from 'express-validator';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  convertLead,
  deleteLead,
} from '../controllers/leadController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

// Validation Rules
const leadValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Lead Name is required.')
    .isLength({ max: 100 })
    .withMessage('Lead Name cannot exceed 100 characters.'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage('Enter a valid phone number (10 to 15 digits).'),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Unqualified', 'Converted', 'Lost'])
    .withMessage('Invalid lead status.'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High.'),
  body('expectedValue')
    .optional()
    .isNumeric()
    .withMessage('Expected value must be a number.')
    .custom((val) => val >= 0)
    .withMessage('Expected value cannot be negative.'),
];

const convertValidation = [
  body('opportunityAmount')
    .optional()
    .custom((val) => {
      if (val !== undefined && val !== null && val !== '') {
        if (isNaN(val) || Number(val) <= 0) {
          throw new Error('Opportunity Amount must be greater than 0.');
        }
      }
      return true;
    }),
  body('opportunityProbability')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100.'),
];

router.use(protect);

router
  .route('/')
  .get(getLeads)
  .post(leadValidation, validateRequest, createLead);

router.post('/:id/convert', convertValidation, validateRequest, convertLead);

router
  .route('/:id')
  .get(getLeadById)
  .put(leadValidation, validateRequest, updateLead)
  .delete(authorizeRoles('Admin', 'Manager'), deleteLead);

export default router;
