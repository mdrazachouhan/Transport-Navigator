import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/register', authController.register);
router.post('/admin-login', authController.adminLogin);

export default router;
