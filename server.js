import cors from "cors";
import express from "express";
import { convertImageToStream, uploadImage } from "./uploadService.js";
import dotenv from 'dotenv';

dotenv.config();
//Setup express
var app = express();
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8081");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// Middleware to parse JSON (if needed)
app.use(express.json()); //Need to understand this better, but req in callback is empty without this

app.get("/", (req, res) => {
  res.send("Welcome to the server!");
});

app.post("/uploadImage", async (req, res) => {
  var buffer = await convertImageToStream(req.body.image, req.body.platform);
  return await uploadImage(buffer, req.body.fileName, req.body.mimeType);
});

// Start the server
console.log(process.env.PORT)
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
