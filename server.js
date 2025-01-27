import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { router as expenseRouter } from "./routes/expense.js";
import { router as subExpense } from "./routes/subExpense.js";
import { router as imageUploadRouter } from "./routes/imageUpload.js";
dotenv.config();
//Setup express
var app = express();
app.use(cors());

// Middleware to parse JSON (if needed)
app.use(express.json()); //Need to understand this better, but req in callback is empty without this

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

app.get("/test", (req, res) => {
  res.status(200).send("<h1>Nodejs Mysql apps</h1>");
});



//routes
app.use("/uploadImage", imageUploadRouter);
app.use("/api/v1/expenses", expenseRouter);
app.use("/api/v1/subexpenses", subExpense);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
