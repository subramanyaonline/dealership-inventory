import { Router } from 'express';
import {
  createVehicle,
  getVehicles,
  searchVehicles,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicle.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Protected: All authenticated users
router.use(authenticate);

router.get('/', getVehicles);
router.get('/search', searchVehicles);

// Protected: Admin only
router.post('/', requireRole('ADMIN'), createVehicle);
router.put('/:id', requireRole('ADMIN'), updateVehicle);
router.delete('/:id', requireRole('ADMIN'), deleteVehicle);

export default router;