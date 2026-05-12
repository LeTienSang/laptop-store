import { Router } from 'express';
import { getProvinces, getCommunes } from '../controllers/locationController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/provinces', asyncHandler(getProvinces));
router.get('/communes', asyncHandler(getCommunes));

export default router;
