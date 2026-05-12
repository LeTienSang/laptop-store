import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';
import { sendError, sendSuccess } from '../utils/response';
import { IAuthedRequest } from '../types';

const router = Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed'));
  },
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags: [Upload]
 *     summary: Upload an image file
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  (req: IAuthedRequest, res: Response) => {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return sendSuccess(res, { url: fileUrl }, 'File uploaded successfully');
  }
);

export default router;
