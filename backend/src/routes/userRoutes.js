import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  unlockUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/role.js';
import { validateRequest } from '../middleware/validate.js';

const router = Router();

const userValidation = [
  body('name').trim().notEmpty().withMessage('User Name is required.'),
  body('email').trim().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('role')
    .optional()
    .isIn(['Admin', 'Manager', 'SalesExecutive'])
    .withMessage('Role must be Admin, Manager, or SalesExecutive.'),
];

router.use(protect);

router
  .route('/')
  .get(authorizeRoles('Admin', 'Manager'), getUsers)
  .post(
    authorizeRoles('Admin'),
    [
      ...userValidation,
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.'),
    ],
    validateRequest,
    createUser
  );

router
  .route('/:id')
  .get(authorizeRoles('Admin', 'Manager'), getUserById)
  .put(authorizeRoles('Admin'), userValidation, validateRequest, updateUser);

router.patch('/:id/status', authorizeRoles('Admin'), toggleUserStatus);
router.post('/:id/unlock', authorizeRoles('Admin'), unlockUser);

export default router;
