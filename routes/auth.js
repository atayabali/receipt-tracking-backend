import express from "express";
import { createBucket, login, signUp } from "../controllers/authController.js";
const router = express.Router();

router.post('/login', login);
router.post('/signup', signUp);
// router.post('/logout', logout);
// router.post('/createBucketTest', createBucket);
export { router };
