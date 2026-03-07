import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import bookingRoutes from './bookingRoutes';
import adminRoutes from './adminRoutes';
import vehicleRoutes from './vehicleRoutes';

export const registerRoutes = (io: any) => {
    const router = Router();

    // Log route usage for debugging
    router.use((req, _res, next) => {
        console.log(`[API-ROUTE] ${req.method} ${req.url}`);
        next();
    });

    router.use('/admin', adminRoutes);
    router.use('/auth', authRoutes);
    router.use('/users', userRoutes(io));
    router.use('/bookings', bookingRoutes(io));
    router.use('/vehicles', vehicleRoutes);

    return router;
};
