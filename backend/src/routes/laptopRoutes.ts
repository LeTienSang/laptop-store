import { Router } from 'express';
import { createLaptop, deleteLaptop, getLaptopById, getLaptops, updateLaptop, getNewLaptops } from '../controllers/laptopController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/laptops:
 *   get:
 *     tags: [Laptops]
 *     summary: Get laptops with filters, search, and pagination
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *       - in: query
 *         name: brandId
 *         schema: { type: integer }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: cpu
 *         schema: { type: string }
 *       - in: query
 *         name: ram
 *         schema: { type: string }
 *       - in: query
 *         name: gpu
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated laptops list
 */
router.get('/', asyncHandler(getLaptops));
router.get('/new', asyncHandler(getNewLaptops));

/**
 * @swagger
 * /api/laptops/{id}:
 *   get:
 *     tags: [Laptops]
 *     summary: Get laptop detail
 */
router.get('/:id', asyncHandler(getLaptopById));

/**
 * @swagger
 * /api/laptops:
 *   post:
 *     tags: [Laptops]
 *     summary: Create laptop
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, requireAdmin, asyncHandler(createLaptop));

/**
 * @swagger
 * /api/laptops/{id}:
 *   put:
 *     tags: [Laptops]
 *     summary: Update laptop
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticateToken, requireAdmin, asyncHandler(updateLaptop));

/**
 * @swagger
 * /api/laptops/{id}:
 *   delete:
 *     tags: [Laptops]
 *     summary: Delete laptop
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(deleteLaptop));

export default router;
