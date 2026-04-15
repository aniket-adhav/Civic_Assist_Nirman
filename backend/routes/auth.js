import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  sendOtp,
  verifyOtp,
  completeProfile,
  adminLogin,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/complete-profile', requireAuth, completeProfile);
router.post('/admin-login', adminLogin);

export default router;
