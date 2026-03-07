
import "dotenv/config";
import mongoose from 'mongoose';
import { connectDB } from './server/config/db';
import { UserModel } from './server/models/User';

async function mockDriver() {
    await connectDB();
    // Update the first driver found to be online and have a location
    const update = await UserModel.findOneAndUpdate(
        { role: 'driver' },
        {
            isOnline: true,
            isApproved: true,
            location: { lat: 28.6139, lng: 77.2090 } // New Delhi
        },
        { new: true }
    );
    console.log('Mocked Driver:', update?.name, update?.location);
    process.exit(0);
}

mockDriver();
