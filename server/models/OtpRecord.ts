import mongoose, { Schema, Document } from 'mongoose';

export interface IOtpRecord extends Document {
    phone: string;
    otp: string;
    expiresAt: Date;
    verified: boolean;
}

const OtpRecordSchema = new Schema<IOtpRecord>({
    phone: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
});

export const OtpRecordModel = mongoose.model<IOtpRecord>('OtpRecord', OtpRecordSchema);
