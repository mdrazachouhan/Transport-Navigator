
import "dotenv/config";
import mongoose from 'mongoose';
import { connectDB } from './server/config/db';
import { UserModel } from './server/models/User';

async function checkDrivers() {
    try {
        await connectDB();
        const drivers = await UserModel.find({ role: 'driver', isOnline: true });
        console.log('Online Drivers Found:', drivers.length);
        drivers.forEach(d => {
            console.log(`Driver: ${d.name} | Phone: ${d.phone} | Role: ${d.role} | Online: ${d.isOnline} | Approved: ${d.isApproved} | Location: ${JSON.stringify(d.location)}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDrivers();
