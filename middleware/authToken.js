import jwt from 'jsonwebtoken';
import { getJwtSecret } from '../secretsManager.js';

export const verifyToken = async(req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  // console.log("verify token is ", token);
  // console.log("t", token);
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const jwt_secret = await getJwtSecret("jwt");
    const decoded = jwt.verify(token, jwt_secret);
    // console.log("d", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

