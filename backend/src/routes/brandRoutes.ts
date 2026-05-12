import { Router } from 'express';
import { createBrand, deleteBrand, getBrandById, getBrands, updateBrand } from '../controllers/brandController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/brands:
 *   get:
 *     tags: [Brands]
 *     summary: Get all brands
 *     responses:
 *       200:
 *         description: Brands list
 */
router.get('/', asyncHandler(getBrands));

/**
 * @swagger
 * /api/brands/{id}:
 *   get:
 *     tags: [Brands]
 *     summary: Get brand by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Brand detail
 *       404:
 *         description: Brand not found
 */
router.get('/:id', asyncHandler(getBrandById));

/**
 * @swagger
 * /api/brands:
 *   post:
 *     tags: [Brands]
 *     summary: Create brand
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, requireAdmin, asyncHandler(createBrand));

/**
 * @swagger
 * /api/brands/{id}:
 *   put:
 *     tags: [Brands]
 *     summary: Update brand
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticateToken, requireAdmin, asyncHandler(updateBrand));

/**
 * @swagger
 * /api/brands/{id}:
 *   delete:
 *     tags: [Brands]
 *     summary: Delete brand
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(deleteBrand));

export default router;
