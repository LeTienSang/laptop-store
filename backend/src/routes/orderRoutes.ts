import { Router } from 'express';
import { createOrder, getAllOrders, getMyOrders, getOrderDetail, updateOrderStatus } from '../controllers/orderController';
import { authenticateToken, requireAdmin, requireCustomer } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a COD order with transaction
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticateToken, requireCustomer, asyncHandler(createOrder));

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders for admin
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, requireAdmin, asyncHandler(getAllOrders));

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: Get current user orders
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-orders', authenticateToken, requireCustomer, asyncHandler(getMyOrders));

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order detail for owner or admin
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticateToken, asyncHandler(getOrderDetail));

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/status', authenticateToken, requireAdmin, asyncHandler(updateOrderStatus));

export default router;
