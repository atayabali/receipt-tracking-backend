
import bcrypt from 'bcryptjs'; //for password hashing
import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";
import jwt from 'jsonwebtoken';
import { getSqlPool } from '../db.js';

const s3 = new S3Client({ region: "us-east-1" });
const mySqlPool = await getSqlPool();
const connection = await mySqlPool.getConnection();

export const createBucket = async (req, res) => {
  const { guidName } = req.body;
  const bucketName =  `receipts-${guidName}`; // Random GUID-based bucket name

  try {
    const command = new CreateBucketCommand({ Bucket: bucketName });
    await s3.send(command);
    console.log(`Bucket created: ${bucketName}`);
  } catch (error) {
    console.error("Error creating bucket:", error);
  }
};

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

/**
 * User Registration (Sign Up)
 */
export async function signUp(req, res) {
  const { email, password, bucketName } = req.body;

  try {
    const [userExists] = await connection.query('SELECT userId FROM userLogins WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await connection.query('INSERT INTO userLogins (email, password_hash, bucketName) VALUES (?, ?, ?)', [email, passwordHash, bucketName]);
    const newUserId = newUser.insertId;
    createBucket(bucketName);
    const accessToken = generateAccessToken(newUserId);
    const refreshToken = generateRefreshToken(newUserId);
  
    // console.log(refreshToken);
    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,//process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ accessToken, user: { id: newUserId, bucketName } });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * User Login
 */
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const [users] = await connection.query('SELECT * FROM userLogins WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user.userId);
    const refreshToken = generateRefreshToken(user.userId);
    // console.log("r", refreshToken);
    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',  // Ensure cookie is available to all routes
    });
    // console.log(req.cookie);
    // console.log(req.cookies);
    res.status(200).json({ accessToken, user: { id: user.userId, bucketName: user.bucketName } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Refresh Token Endpoint
 */
export const refreshToken = async (req, res) => {
  // console.log(req.cookies.refreshToken);
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded.userId);
    
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

/**
 * User Logout
 */
export async function logout(req, res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });

  res.json({ message: 'User logged out' });
};
