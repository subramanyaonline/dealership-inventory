import { Router } from 'express';
import {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from '../controllers/vehicle.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Public: Anyone can view and search inventory
router.get('/', getVehicles);
router.get('/search', searchVehicles);

// Protected: Requires authentication
router.post('/:id/purchase', authenticate, purchaseVehicle);

// Protected: Admin only
router.post('/', authenticate, requireRole('ADMIN'), createVehicle);
router.put('/:id', authenticate, requireRole('ADMIN'), updateVehicle);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteVehicle);
router.post('/:id/restock', authenticate, requireRole('ADMIN'), restockVehicle);

export default router;