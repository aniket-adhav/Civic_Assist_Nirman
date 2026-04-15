import User from '../models/User.js';

const ADMIN_ID = 'ADM-00001';
const ADMIN_PASSWORD = 'admin123';

export async function sendOtp(req, res) {
  const { phone } = req.body;
  if (!phone || String(phone).length < 10) {
    return res.status(400).json({ error: 'Valid phone number required' });
  }
  res.json({ success: true, message: 'OTP sent' });
}

export async function verifyOtp(req, res) {
  try {
    const { phone } = req.body;
    if (!phone || String(phone).length < 10) {
      return res.status(400).json({ error: 'Valid phone number required' });
    }

    let user = await User.findOne({ phone: String(phone) });
    const isNew = !user;

    if (!user) {
      user = await User.create({ phone: String(phone) });
    }

    res.json({
      success: true,
      userId: user._id.toString(),
      isNew,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name || null,
      },
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function completeProfile(req, res) {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name: name.trim() },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
      },
    });
  } catch (err) {
    console.error('complete-profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export function adminLogin(req, res) {
  const { adminId, password } = req.body;
  if (adminId !== ADMIN_ID || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  res.json({ success: true, token: 'CIVIC_ADMIN' });
}
