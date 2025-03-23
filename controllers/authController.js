
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


// const JWT_SECRET = process.env.JWT_SECRET;

/**
 * User Registration (Sign Up)
 */
export async function signUp(req, res){
  const { email, password, bucketName } = req.body;

  try {
    const [userExists] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [newUser] = await connection.query('INSERT INTO users (email, password_hash, bucketName) VALUES (?, ?, ?)', [email, passwordHash, bucketName]);
    var newUserId = newUser.insertId;
    // Create an S3 bucket for the user
    // createBucket(bucketName);
    
    const accessToken = jwt.sign({ userId: newUserId }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: newUserId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    
    res.status(201).json({ accessToken, refreshToken, user: { id: newUserId, bucketName: bucketName } });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * User Login
 */
export async function login(req, res){
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const accessToken = jwt.sign({ userId: newUserId }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: newUserId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    
    res.status(201).json({ accessToken, refreshToken, user: { id: newUserId, bucketName: bucketName } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// This function verifies the refresh token and issues a new access token. 
// It's crucial for maintaining the user's authenticated state without 
// frequent logins.
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

/**
 * User Logout (Handled on frontend by clearing token)
 */
// export async function logout(req, res){
//   res.json({ message: 'User logged out' }); // Token should be removed from frontend
// };


