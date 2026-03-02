import { Request, Response } from 'express';
import { storage } from '../storage';

function paramId(params: any): string {
    const id = params.id;
    return Array.isArray(id) ? id[0] : id;
}

export const getStats = async (req: Request, res: Response) => {
    res.json(await storage.getStats());
};

export const getUsers = async (req: Request, res: Response) => {
    const { role } = req.query;
    const users = role ? await storage.getUsersByRole(role as string) : await storage.getAllUsers();
    res.json({ users: users.filter(u => u.role !== 'admin') });
};

export const approveUser = async (req: Request, res: Response) => {
    const user = await storage.updateUser(paramId(req.params), { isApproved: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
};

export const deleteUser = async (req: Request, res: Response) => {
    await storage.deleteUser(paramId(req.params));
    res.json({ success: true });
};

export const getAllBookings = async (req: Request, res: Response) => {
    res.json({ bookings: await storage.getAllBookings() });
};

export const getVehicles = async (req: Request, res: Response) => {
    res.json({ vehicles: await storage.getVehicles() });
};

export const updateVehicle = async (req: Request, res: Response) => {
    const { baseFare, perKmCharge, isActive } = req.body;
    const vehicle = await storage.updateVehicle(paramId(req.params), { baseFare, perKmCharge, isActive });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ vehicle });
};

export const getOnlineDrivers = async (req: Request, res: Response) => {
    res.json({ drivers: await storage.getOnlineDrivers() });
};
