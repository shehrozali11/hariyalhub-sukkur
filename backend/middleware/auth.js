const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hariyalhub_sukkur_iba_secret_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token' });
  }
}

function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Super Admin privileges required' });
    }
    next();
  });
}

function requireNurseryOwner(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'nursery_owner') {
      return res.status(403).json({ message: 'Nursery Owner account required' });
    }
    next();
  });
}

module.exports = { verifyToken, requireAdmin, requireNurseryOwner };
