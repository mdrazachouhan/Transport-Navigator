import { Request, Response } from 'express';
import { storage } from '../storage';
import { JwtPayload } from '../middleware/auth';

export const getMe = async (req: Request, res: Response) => {
    const { userId } = (req as any).user as JwtPayload;
    const user = await storage.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
};

export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = (req as any).user as JwtPayload;
    const { name, vehicleType, vehicleNumber, licenseNumber } = req.body;
    const user = await storage.updateUser(userId, { name, vehicleType, vehicleNumber, licenseNumber });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
};

export const toggleOnline = (io: any) => async (req: Request, res: Response) => {
    const { userId } = (req as any).user as JwtPayload;
    const user = await storage.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const updated = await storage.updateUser(userId, { isOnline: !user.isOnline });

    // Broadcast status change to admin panel
    io.emit('driver:online:update', { driverId: userId, isOnline: updated?.isOnline });

    res.json({ user: updated });
};
