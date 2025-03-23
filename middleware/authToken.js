import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  console.log("t", token);
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("d", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

