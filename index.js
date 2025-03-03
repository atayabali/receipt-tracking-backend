import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { router as expenseRouter } from "./routes/expense.js";
import { router as subExpense } from "./routes/subExpense.js";
import { router as imageUploadRouter } from "./routes/imageUpload.js";
import awsServererlessExpress from 'aws-serverless-express'
dotenv.config();
//Setup express
var app = express();
app.use(cors());

// Middleware to parse JSON (if needed)
app.use(express.json()); //Need to understand this better, but req in callback is empty without this
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
//base route won't work in lamdba
// app.get("/", (req, res) => { 
//   res.send("Welcome to the server!");
// });

app.get("/test", (req, res) => {
  res.status(200).send("<h1>Nodejs Mysql apps</h1>");
});

//routes
app.use("/images", imageUploadRouter);
app.use("/api/v1/expenses", expenseRouter);
app.use("/api/v1/subexpenses", subExpense);

// const server = awsServererlessExpress.createServer(app);
// export const handler = (event, context) => awsServerlessExpress.proxy(server, event, context);

app.listen(5000, () => {
  console.log(`Server is running on http://localhost:5000`);
});


