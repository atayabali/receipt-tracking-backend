import cors from "cors";
import express from "express";
import dotenv from 'dotenv';
import { createPresignedUrlWithClient } from "./signedUrlService.js";
import { summaryRouter } from "./routes/summaryRoutes.js";
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

app.get('/test', (req, res) => {
  res.status(200).send('<h1>Nodejs Mysql apps</h1>')
});

app.post("/presignedUrl", async(req, res) => {
  var presignedUrl = await createPresignedUrlWithClient(req.body.fileName, req.body.mimeType)
  console.log("url", presignedUrl);
  res.send({url: presignedUrl});
});

//routes
app.use('/api/v1/expenseSummary', summaryRouter)

// app.post("/uploadImage", async (req, res) => {
//   var buffer = await convertImageToStream(req.body.image, req.body.platform);
//   console.log("buffer " + buffer);
//   var response = await uploadWithPresignedUrl(buffer);
//   console.log(response);
//   // return await uploadImage(buffer, req.body.fileName, req.body.mimeType);
// });

// Start the server
console.log(process.env.PORT)
console.log(process.env.DATABASE_PASSWORD)
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
