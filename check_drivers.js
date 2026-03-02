
const mongoose = require('mongoose');
require('dotenv').config();

const BookingSchema = new mongoose.Schema({
    driverId: String,
    status: String,
    rating: Number,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: String,
    phone: String,
    role: String,
    rating: Number,
}, { timestamps: true });

const BookingModel = mongoose.model('Booking', BookingSchema);
const UserModel = mongoose.model('User', UserSchema);

async function checkIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const drivers = await UserModel.find({ role: 'driver' });
        console.log('--- Drivers ---');
        drivers.forEach(d => console.log(`ID: ${d._id}, Phone: ${d.phone}, Name: ${d.name}, Rating: ${d.rating}`));

        const ratedBookings = await BookingModel.find({ rating: { $exists: true } });
        console.log('\n--- Rated Bookings ---');
        ratedBookings.forEach(b => console.log(`ID: ${b._id}, DriverID: ${b.driverId}, Rating: ${b.rating}`));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkIds();
