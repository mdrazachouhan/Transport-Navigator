
const mongoose = require('mongoose');
require('dotenv').config();

const BookingSchema = new mongoose.Schema({
    driverId: String,
    rating: Number,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    rating: Number,
}, { timestamps: true });

const BookingModel = mongoose.model('Booking', BookingSchema);
const UserModel = mongoose.model('User', UserSchema);

async function triggerRecalc() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Find the driver from our previous check
        const driverId = '67abc7be9df40237caf1659f';
        const driverBookings = await BookingModel.find({ driverId });

        const ratedBookings = driverBookings.filter(b => b.rating && b.rating > 0);
        console.log(`Found ${ratedBookings.length} rated bookings for driver ${driverId}`);

        if (ratedBookings.length > 0) {
            const totalRating = ratedBookings.reduce((sum, b) => sum + (b.rating || 0), 0);
            const avgRating = totalRating / ratedBookings.length;
            const finalRating = Math.round(avgRating * 10) / 10;

            console.log(`Recalculated Average: ${finalRating}`);

            const updatedUser = await UserModel.findByIdAndUpdate(driverId, { $set: { rating: finalRating } }, { new: true });
            console.log(`Updated Driver Rating in DB: ${updatedUser.rating}`);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

triggerRecalc();
