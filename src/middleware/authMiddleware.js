// backend/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_super_secreta');
    req.user = decoded;
    req.tenantId = decoded.tenantId;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Error de verificación JWT:', error);
    return res.status(403).json({ message: 'Token inválido o expirado.' });
  }
};
