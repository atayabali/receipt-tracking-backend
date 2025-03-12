import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { router as expenseRouter } from "./routes/expense.js";
import { router as subExpense } from "./routes/subExpense.js";
import { router as imageUploadRouter } from "./routes/imageUpload.js";
import { errorMiddleware } from "./errorMiddleware.js";

dotenv.config();
var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const allowedOrigins = ["http://localhost:8081", "http://receipt-tracking-frontend-v2.s3-website-us-east-1.amazonaws.com"];
app.use(function (req, res, next) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//routes
app.use("/images", imageUploadRouter);
app.use("/api/v1/expenses", expenseRouter);
app.use("/api/v1/subexpenses", subExpense);

app.use(errorMiddleware); 

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


