import { Request, Response } from 'express';
import { storage } from '../storage';
import { JwtPayload } from '../middleware/auth';

function toRad(deg: number) { return (deg * Math.PI) / 180; }

function calculateDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const R = 6371;
    const dLat = toRad(to.lat - from.lat);
    const dLng = toRad(to.lng - from.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function paramId(params: any): string {
    const id = params.id;
    return Array.isArray(id) ? id[0] : id;
}

export const createBooking = (io: any) => async (req: Request, res: Response) => {
    try {
        const { userId } = (req as any).user as JwtPayload;
        const user = await storage.getUserById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { pickup, delivery, vehicleType, paymentMethod } = req.body;

        console.log(`[CREATE-BOOKING] Request from ${user.name} (${userId})`);
        console.log(`[CREATE-BOOKING] Pickup: ${pickup?.name}, Delivery: ${delivery?.name}, Vehicle: ${vehicleType}`);

        if (!pickup || !delivery || !vehicleType) {
            return res.status(400).json({ error: 'Pickup, delivery and vehicle type required' });
        }

        const vehicle = await storage.getVehicleByType(vehicleType);
        if (!vehicle) {
            console.warn(`[CREATE-BOOKING] Invalid vehicle type: ${vehicleType}`);
            return res.status(400).json({ error: 'Invalid vehicle type. Please select from available options.' });
        }

        // Validate coordinates
        if (!pickup.lat || !pickup.lng || !delivery.lat || !delivery.lng) {
            console.warn(`[CREATE-BOOKING] Invalid coordinates provided`);
            return res.status(400).json({ error: 'Invalid location coordinates. Please try selecting the location again.' });
        }

        const distance = calculateDistance(pickup, delivery);
        const distanceCharge = Math.round(distance * vehicle.perKmCharge);
        const totalPrice = vehicle.baseFare + distanceCharge;
        const estimatedTime = Math.round(distance * 3 + 5);
        const otp = generateOTP();

        const booking = await storage.createBooking({
            customerId: userId, customerName: user.name, customerPhone: user.phone,
            pickup, delivery, vehicleType, distance, basePrice: vehicle.baseFare,
            distanceCharge, totalPrice, estimatedTime, paymentMethod: paymentMethod || 'cash',
            status: 'pending', otp,
        });

        console.log(`[CREATE-BOOKING] Success: ${booking.id}`);
        io.emit('booking:new', { booking });
        res.json({ booking });
    } catch (error: any) {
        console.error(`[CREATE-BOOKING] CRITICAL ERROR:`, error);
        res.status(500).json({ error: 'Internal server error while creating booking. Please try again.' });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    const { userId, role } = (req as any).user as JwtPayload;
    let bookings;
    if (role === 'customer') bookings = await storage.getBookingsByCustomer(userId);
    else if (role === 'driver') bookings = await storage.getBookingsByDriver(userId);
    else bookings = await storage.getAllBookings();
    res.json({ bookings });
};

export const getPendingBookings = async (req: Request, res: Response) => {
    const { userId } = (req as any).user as JwtPayload;
    const user = await storage.getUserById(userId);

    // Safety check: Only online drivers should see pending rides
    if (!user?.isOnline) {
        return res.json({ bookings: [] });
    }

    const bookings = await storage.getPendingBookings(user?.vehicleType);
    res.json({ bookings });
};

export const getBookingById = async (req: Request, res: Response) => {
    const booking = await storage.getBookingById(paramId(req.params));
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
};

export const acceptBooking = (io: any) => async (req: Request, res: Response) => {
    const { userId } = (req as any).user as JwtPayload;
    const bookingId = paramId(req.params);

    try {
        const driver = await storage.getUserById(userId);
        if (!driver) {
            console.error(`[ACCEPT-RIDE] Driver ${userId} not found in DB`);
            return res.status(404).json({ error: 'Driver profile not found. Please log in again.' });
        }

        const booking = await storage.getBookingById(bookingId);
        if (!booking) {
            console.error(`[ACCEPT-RIDE] Booking ${bookingId} not found`);
            return res.status(404).json({ error: 'Ride request no longer exists.' });
        }

        console.log(`[ACCEPT-RIDE] Driver: ${driver.name} (${driver.vehicleType}), Booking: ${booking.id} (${booking.vehicleType}), Status: ${booking.status}`);

        if (booking.status !== 'pending') {
            return res.status(400).json({ error: `Ride status is '${booking.status}'. It can only be accepted if pending.` });
        }

        // Case-insensitive vehicle type matching
        const driverVT = (driver.vehicleType || '').toLowerCase().trim();
        const bookingVT = (booking.vehicleType || '').toLowerCase().trim();

        if (driverVT !== bookingVT && driver.role !== 'admin') {
            console.warn(`[ACCEPT-RIDE] Vehicle mismatch: Driver=${driverVT}, Booking=${bookingVT}`);
            return res.status(403).json({ error: `Vehicle mismatch! Your ${driverVT} cannot accept a ${bookingVT} request.` });
        }

        const updated = await storage.updateBooking(bookingId, {
            status: 'accepted',
            driverId: userId,
            driverName: driver.name,
            driverPhone: driver.phone,
            driverVehicleNumber: driver.vehicleNumber || 'N/A',
            acceptedAt: new Date().toISOString(),
        });

        if (!updated) throw new Error('Failed to update booking in database');

        console.log(`[ACCEPT-RIDE] Successfully accepted: ${bookingId}`);
        io.emit('booking:updated', { booking: updated });
        res.json({ booking: updated });
    } catch (error: any) {
        console.error(`[ACCEPT-RIDE] CRITICAL ERROR:`, error);
        res.status(500).json({ error: 'Internal server error while accepting ride' });
    }
};

export const startTrip = (io: any) => async (req: Request, res: Response) => {
    const { otp } = req.body;
    const bookingId = paramId(req.params);

    try {
        const booking = await storage.getBookingById(bookingId);
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (booking.status !== 'accepted') {
            return res.status(400).json({ error: `Cannot start trip from '${booking.status}' status.` });
        }

        if (booking.otp !== otp) {
            return res.status(400).json({ error: 'Invalid verification code (OTP)' });
        }

        const updated = await storage.updateBooking(bookingId, {
            status: 'in_progress',
            startedAt: new Date().toISOString()
        });

        io.emit('booking:updated', { booking: updated });
        res.json({ booking: updated });
    } catch (error: any) {
        console.error(`[START-TRIP] Error:`, error);
        res.status(500).json({ error: 'Failed to start trip' });
    }
};

export const completeTrip = (io: any) => async (req: Request, res: Response) => {
    const { userId } = (req as any).user as JwtPayload;
    const booking = await storage.getBookingById(paramId(req.params));
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'in_progress') return res.status(400).json({ error: 'Trip not in progress' });

    const updated = await storage.updateBooking(paramId(req.params), { status: 'completed', completedAt: new Date().toISOString() });
    const driver = await storage.getUserById(userId);
    if (driver) {
        await storage.updateUser(userId, {
            totalTrips: (driver.totalTrips || 0) + 1,
            totalEarnings: (driver.totalEarnings || 0) + booking.totalPrice,
        });
    }
    io.emit('booking:updated', { booking: updated });
    res.json({ booking: updated });
};

export const cancelBooking = (io: any) => async (req: Request, res: Response) => {
    const { reason } = req.body;
    const booking = await storage.getBookingById(paramId(req.params));
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (['completed', 'cancelled'].includes(booking.status)) return res.status(400).json({ error: 'Cannot cancel this booking' });

    const updated = await storage.updateBooking(paramId(req.params), { status: 'cancelled', cancelReason: reason, cancelledAt: new Date().toISOString() });
    io.emit('booking:updated', { booking: updated });
    res.json({ booking: updated });
};

export const rateBooking = async (req: Request, res: Response) => {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating 1-5 required' });
    const booking = await storage.getBookingById(paramId(req.params));
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    console.log(`[RATING] Rating booking ${booking.id} with ${rating}. DriverId: ${booking.driverId}`);

    const updated = await storage.updateBooking(paramId(req.params), { rating, ratingComment: comment });

    // Update driver's average rating
    if (booking.driverId) {
        // Fetch all bookings for this driver to recalculate average
        const driverBookings = await storage.getBookingsByDriver(booking.driverId);

        // Ensure the current updated rating is considered even if query is laggy
        let bookingsWithRatings = driverBookings.map(b => {
            if (b.id === booking.id) return { ...b, rating };
            return b;
        }).filter(b => b.rating && b.rating > 0);

        if (bookingsWithRatings.length > 0) {
            const totalRating = bookingsWithRatings.reduce((sum, b) => sum + (b.rating || 0), 0);
            const avgRating = totalRating / bookingsWithRatings.length;
            const finalRating = Math.round(avgRating * 10) / 10;

            console.log(`[RATING] Driver ${booking.driverId}: Total=${totalRating}, Count=${bookingsWithRatings.length}, Avg=${finalRating}`);

            const updatedUser = await storage.updateUser(booking.driverId, { rating: finalRating });
            if (updatedUser) {
                console.log(`[RATING] Updated driver ${booking.driverId} rating to ${finalRating}`);
            } else {
                console.error(`[RATING] Failed to update driver ${booking.driverId} profile with rating`);
            }
        }
    }

    res.json({ booking: updated });
};
