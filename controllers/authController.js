
import bcrypt from 'bcryptjs'; //for password hashing
import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-east-1" });

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
    const [userExists] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (email, password_hash, bucketName) VALUES (?, ?, ?)', [email, passwordHash, bucketName]);

    // Create an S3 bucket for the user
    createBucket(bucketName);

    res.status(201).json({ message: 'User registered successfully' });
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

//TO DO: Add JSON WEB TOKEN for proper authorization at a later point
    // const token = jwt.sign({ userId: user.id, guid: user.bucketName }, JWT_SECRET, { expiresIn: '7d' });

    // res.json({ token, guid: user.bucketName });
    res.json({ userBucket: user.bucketName });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * User Logout (Handled on frontend by clearing token)
 */
// export async function logout(req, res){
//   res.json({ message: 'User logged out' }); // Token should be removed from frontend
// };

