import mongoose, { Schema, Document } from 'mongoose';

export interface IVehiclePricing extends Document {
    type: string;
    name: string;
    baseFare: number;
    perKmCharge: number;
    capacity: string;
    icon: string;
    isActive: boolean;
}

const VehiclePricingSchema = new Schema<IVehiclePricing>({
    type: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    baseFare: { type: Number, required: true },
    perKmCharge: { type: Number, required: true },
    capacity: String,
    icon: String,
    isActive: { type: Boolean, default: true },
});

export const VehiclePricingModel = mongoose.model<IVehiclePricing>('VehiclePricing', VehiclePricingSchema);
