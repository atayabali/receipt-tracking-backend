import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { router as expenseRouter } from "./routes/expense.js";
import { router as subExpense } from "./routes/subExpense.js";
import { router as imageUploadRouter } from "./routes/imageUpload.js";
import {router as authRouter } from "./routes/auth.js";
import { errorMiddleware } from "./errorMiddleware.js";
import cookieParser from 'cookie-parser';
import { verifyToken } from "./middleware/authToken.js";

dotenv.config();
const app = express();

// Allowed origins for CORS
const allowedOrigins = ["http://localhost:8081"]; 

// Middleware for cookie parsing
app.use(cookieParser());

// CORS configuration for specific origins and credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow only requests from allowed origins
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);  // Allow the request
      } else {
        callback(new Error('Not allowed by CORS'), false); // Reject other origins
      }
    },
    credentials: true,       // Allow credentials (cookies, authorization headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow certain headers
  })
);

// JSON and URL-encoded body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//routes
app.use("/api/v1/images", verifyToken, imageUploadRouter);
app.use("/api/v1/expenses", verifyToken, expenseRouter);
app.use("/api/v1/subexpenses", subExpense);
app.use("/api/v1/auth", authRouter )

app.use(errorMiddleware); 

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


