import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

export default (io: any) => {
    const router = Router();

    router.get('/me', authMiddleware, userController.getMe);
    router.put('/profile', authMiddleware, userController.updateProfile);
    router.put('/toggle-online', authMiddleware, roleMiddleware('driver'), userController.toggleOnline(io));

    return router;
};
