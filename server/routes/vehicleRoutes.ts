import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

router.get('/', async (req, res) => {
    const vehicles = (await storage.getVehicles()).filter(v => v.isActive);
    res.json({ vehicles });
});

export default router;
