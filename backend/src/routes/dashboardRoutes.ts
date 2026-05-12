import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', authenticateToken, requireAdmin, asyncHandler(getDashboardStats));

export default router;
