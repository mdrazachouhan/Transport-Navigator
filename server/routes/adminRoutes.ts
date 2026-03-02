import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, roleMiddleware('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/approve', adminController.approveUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/bookings', adminController.getAllBookings);
router.get('/vehicles', adminController.getVehicles);
router.put('/vehicles/:id', adminController.updateVehicle);
router.get('/drivers/online', adminController.getOnlineDrivers);

export default router;
