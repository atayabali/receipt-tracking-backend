
import bcrypt from 'bcryptjs'; //for password hashing
import { S3Client, CreateBucketCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import jwt from 'jsonwebtoken';
import { getSqlPool } from '../db.js';

const s3 = new S3Client({ region: "us-east-1" });
const mySqlPool = await getSqlPool();
const connection = await mySqlPool.getConnection();

export const createBucket = async (bucketIdentifier) => {
  const bucketName =  `receipts-${bucketIdentifier}`; // Random GUID-based bucket name

  try {
    const command = new CreateBucketCommand({ Bucket: bucketName });
    await s3.send(command);
    console.log(`Bucket created: ${bucketName}`);

        // Step 2: Define the CORS configuration
        const corsRules = [
          {
            AllowedOrigins: ["http://localhost:8081"], // Your frontend URL
            AllowedMethods: ["GET", "POST", "PUT", "DELETE"], // Allow file uploads
            AllowedHeaders: ["*"], // Allow all headers
            ExposeHeaders: ["ETag"], // Optional: Expose headers in the response
            MaxAgeSeconds: 3000
          }
        ];
    
        // Step 3: Apply the CORS settings
        const corsCommand = new PutBucketCorsCommand({
          Bucket: bucketName,
          CORSConfiguration: { CORSRules: corsRules }
        });
        await s3.send(corsCommand);
        console.log(`CORS set for bucket: ${bucketName}`);
  } catch (error) {
    console.error("Error creating bucket:", error);
  }
};

const generateAccessToken = (userId, bucketIdentifier) => {
  return jwt.sign({ userId, bucketIdentifier }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId, bucketIdentifier) => {
  return jwt.sign({ userId, bucketIdentifier }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

/**
 * User Registration (Sign Up)
 */
export async function signUp(req, res) {
  const { email, password, bucketIdentifier } = req.body;

  try {
    const [userExists] = await connection.query('SELECT userId FROM userLogins WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await connection.query('INSERT INTO userLogins (email, password_hash, bucketIdentifier) VALUES (?, ?, ?)', [email, passwordHash, bucketIdentifier]);
    const newUserId = newUser.insertId;
    createBucket(bucketIdentifier);
    const accessToken = generateAccessToken(newUserId, bucketIdentifier);
    const refreshToken = generateRefreshToken(newUserId, bucketIdentifier);
  
    // console.log(refreshToken);
    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,//process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ accessToken, user: { id: newUserId, bucketIdentifier } });
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

    const accessToken = generateAccessToken(user.userId, user.bucketIdentifier);
    const refreshToken = generateRefreshToken(user.userId, user.bucketIdentifier);
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
    res.status(200).json({ accessToken, user: { id: user.userId, bucketIdentifier: user.bucketIdentifier } });
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
