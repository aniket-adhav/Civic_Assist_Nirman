import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = header.slice(7);
  if (userId === 'CIVIC_ADMIN') {
    return res.status(403).json({ error: 'Admin cannot perform user actions' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { userId: user._id.toString(), phone: user.phone };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid session' });
  }
}

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const userId = header.slice(7);
    if (userId !== 'CIVIC_ADMIN') {
      try {
        const user = await User.findById(userId);
        if (user) req.user = { userId: user._id.toString(), phone: user.phone };
      } catch {}
    }
  }
  next();
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (header.slice(7) === 'CIVIC_ADMIN') {
    req.admin = { role: 'admin' };
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
}
