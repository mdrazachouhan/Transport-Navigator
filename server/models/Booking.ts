import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
    customerId: string;
    customerName: string;
    customerPhone: string;
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    driverVehicleNumber?: string;
    pickup: { name: string; area: string; lat: number; lng: number };
    delivery: { name: string; area: string; lat: number; lng: number };
    vehicleType: string;
    distance: number;
    basePrice: number;
    distanceCharge: number;
    totalPrice: number;
    estimatedTime: number;
    paymentMethod: 'cash' | 'upi';
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    otp: string;
    rating?: number;
    ratingComment?: string;
    cancelReason?: string;
    acceptedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    createdAt: Date;
}

const LocationSubSchema = {
    name: { type: String, required: true },
    area: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
};

const BookingSchema = new Schema<IBooking>({
    customerId: { type: String, required: true, index: true },
    customerName: String,
    customerPhone: String,
    driverId: { type: String, index: true },
    driverName: String,
    driverPhone: String,
    driverVehicleNumber: String,
    pickup: LocationSubSchema,
    delivery: LocationSubSchema,
    vehicleType: { type: String, required: true },
    distance: Number,
    basePrice: Number,
    distanceCharge: Number,
    totalPrice: Number,
    estimatedTime: Number,
    paymentMethod: { type: String, enum: ['cash', 'upi'], default: 'cash' },
    status: { type: String, enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'], default: 'pending', index: true },
    otp: String,
    rating: Number,
    ratingComment: String,
    cancelReason: String,
    acceptedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
}, { timestamps: true });

export const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);
