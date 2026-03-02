import { Request, Response } from 'express';
import { storage } from '../storage';
import { generateToken } from '../middleware/auth';

function generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

export const sendOtp = async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone || phone.length < 10) return res.status(400).json({ error: 'Valid phone number required' });
    const otp = generateOTP();
    await storage.saveOtp(phone, otp);
    console.log(`[OTP] ${phone}: ${otp}`);
    res.json({ success: true, message: 'OTP sent successfully', otp });
};

export const verifyOtp = async (req: Request, res: Response) => {
    const { phone, otp, role } = req.body;
    console.log(`[VERIFY] ${phone}: attempting OTP ${otp}`);
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
    const valid = await storage.verifyOtp(phone, otp);
    if (!valid) {
        console.log(`[VERIFY] ${phone}: OTP verification failed`);
        return res.status(400).json({ error: 'Invalid or expired OTP. Please tap "Resend OTP" and try again.' });
    }
    console.log(`[VERIFY] ${phone}: OTP verified successfully`);
    let user = await storage.getUserByPhone(phone);
    const isNew = !user;
    if (!user) {
        user = await storage.createUser({ name: '', phone, role: role || 'customer', isOnline: false, isApproved: true });
    } else if (role && role !== user.role && user.role !== 'admin') {
        user = (await storage.updateUser(user.id, { role, isApproved: true }))!;
    }
    const token = generateToken({ userId: user.id, phone: user.phone, role: user.role });
    res.json({ success: true, token, user, isNew });
};

export const register = async (req: Request, res: Response) => {
    const { phone, name, role, vehicleType, vehicleNumber, licenseNumber } = req.body;
    if (!phone || !name) return res.status(400).json({ error: 'Phone and name required' });
    let user = await storage.getUserByPhone(phone);
    if (user) {
        user = (await storage.updateUser(user.id, { name, role: role || user.role, vehicleType, vehicleNumber, licenseNumber, isApproved: true }))!;
    } else {
        user = await storage.createUser({
            name, phone, role: role || 'customer', vehicleType, vehicleNumber, licenseNumber,
            isOnline: false, isApproved: true, rating: role === 'driver' ? 4.0 : undefined,
            totalTrips: 0, totalEarnings: 0,
        });
    }
    const token = generateToken({ userId: user.id, phone: user.phone, role: user.role });
    res.json({ success: true, token, user });
};

export const adminLogin = async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    const user = await storage.getUserByPhone(phone);
    if (!user || user.role !== 'admin' || user.password !== password) {
        console.log(`[ADMIN LOGIN FAIL] Phone: ${phone}, Found: ${!!user}, Role: ${user?.role}, PassMatch: ${user?.password === password}`);
        return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    console.log(`[ADMIN LOGIN SUCCESS] User: ${user.phone}`);
    const token = generateToken({ userId: user.id, phone: user.phone, role: user.role });
    res.json({ success: true, token, user });
};
