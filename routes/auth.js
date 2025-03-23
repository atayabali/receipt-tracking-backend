import express from "express";
import { createBucket, login, refreshToken, signUp } from "../controllers/authController.js";
const router = express.Router();

router.post('/login', login);
router.post('/signup', signUp);
router.post('/refresh-token', refreshToken)
// router.post('/refresh-token', refreshToken);
// router.post('/google', googleAuth);

// router.post('/logout', logout);
// router.post('/createBucketTest', createBucket);
export { router };
