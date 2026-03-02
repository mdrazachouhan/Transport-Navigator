import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

export default (io: any) => {
    const router = Router();

    router.post('/', authMiddleware, roleMiddleware(['customer', 'admin', 'driver']), bookingController.createBooking(io));
    router.get('/', authMiddleware, bookingController.getBookings);
    router.get('/pending', authMiddleware, roleMiddleware(['driver', 'admin']), bookingController.getPendingBookings);
    router.get('/:id', authMiddleware, bookingController.getBookingById);
    router.put('/:id/accept', authMiddleware, roleMiddleware(['driver', 'admin']), bookingController.acceptBooking(io));
    router.put('/:id/start', authMiddleware, roleMiddleware(['driver', 'admin']), bookingController.startTrip(io));
    router.put('/:id/complete', authMiddleware, roleMiddleware(['driver', 'admin']), bookingController.completeTrip(io));
    router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking(io));
    router.put('/:id/rate', authMiddleware, roleMiddleware(['customer', 'admin', 'driver']), bookingController.rateBooking);

    return router;
};
