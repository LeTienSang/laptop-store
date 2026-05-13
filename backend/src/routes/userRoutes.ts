import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, changePassword } from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get users list
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, requireAdmin, asyncHandler(getUsers));

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CUSTOMER]
 */
router.post('/', authenticateToken, requireAdmin, asyncHandler(createUser));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user detail
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticateToken, requireAdmin, asyncHandler(getUserById));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticateToken, requireAdmin, asyncHandler(updateUser));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(deleteUser));

/**
 * @swagger
 * /api/users/{id}/password:
 *   patch:
 *     tags: [Users]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/password', authenticateToken, requireAdmin, asyncHandler(changePassword));

export default router;
