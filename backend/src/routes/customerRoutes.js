import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

// Validation Rules
const customerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer Name is required.')
    .isLength({ max: 100 })
    .withMessage('Customer Name cannot exceed 100 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage('Enter a valid phone number (10 to 15 digits).'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Lead'])
    .withMessage('Status must be Active, Inactive, or Lead.'),
];

router.use(protect);

router
  .route('/')
  .get(getCustomers)
  .post(customerValidation, validateRequest, createCustomer);

router
  .route('/:id')
  .get(getCustomerById)
  .put(customerValidation, validateRequest, updateCustomer)
  .delete(authorizeRoles('Admin', 'Manager'), deleteCustomer);

export default router;
