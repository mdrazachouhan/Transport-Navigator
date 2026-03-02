
const mongoose = require('mongoose');
require('dotenv').config();

// User Schema
const UserSchema = new mongoose.Schema({
    phone: String,
    rating: Number,
}, { strict: false });

// Booking Schema
const BookingSchema = new mongoose.Schema({
    driverId: String,
    rating: Number,
}, { strict: false });

const User = mongoose.model('User', UserSchema);
const Booking = mongoose.model('Booking', BookingSchema);

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const driver = await User.findOne({ phone: '8888800001' });
        if (!driver) {
            console.log('Driver not found');
            process.exit(1);
        }

        console.log(`Driver ID: ${driver._id}`);

        // Find ALL bookings for this driver ID
        const bookings = await Booking.find({ driverId: driver._id.toString() });
        console.log(`Found ${bookings.length} bookings for driver ${driver._id}`);

        const rated = bookings.filter(b => b.rating);
        console.log(`${rated.length} bookings have ratings`);

        if (rated.length > 0) {
            const sum = rated.reduce((s, b) => s + b.rating, 0);
            const avg = sum / rated.length;
            const final = Math.round(avg * 10) / 10;
            console.log(`Recalculated Average: ${final}`);

            await User.findByIdAndUpdate(driver._id, { $set: { rating: final } });
            console.log('Updated driver rating successfully');
        } else {
            // Let's try to find ANY booking for this driver
            const any = await Booking.findOne({ driverId: driver._id.toString() });
            if (any) {
                console.log(`Example booking for this driver: rating=${any.rating}, status=${any.status}`);
            } else {
                console.log('No bookings found at all for this driver ID string');

                // Maybe it's stored as an ObjectId?
                const anyObjId = await Booking.findOne({ driverId: driver._id });
                if (anyObjId) {
                    console.log('Found booking using ObjectId instead of String!');
                }
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verify();
