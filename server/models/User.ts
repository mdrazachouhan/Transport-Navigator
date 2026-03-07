import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    phone: string;
    role: 'customer' | 'driver' | 'admin';
    password?: string;
    vehicleType?: string;
    vehicleNumber?: string;
    licenseNumber?: string;
    isOnline?: boolean;
    isApproved?: boolean;
    rating?: number;
    totalTrips?: number;
    totalEarnings?: number;
    location?: { lat: number; lng: number };
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, default: '' },
    phone: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['customer', 'driver', 'admin'], required: true },
    password: String,
    vehicleType: String,
    vehicleNumber: String,
    licenseNumber: String,
    isOnline: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    rating: Number,
    totalTrips: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    location: {
        lat: Number,
        lng: Number,
    },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', UserSchema);
