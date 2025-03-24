import express from "express";
import {
  analyzeExpenseObject,
  createPresignedUrlWithClient,
  formatExpenseResponse,
  getS3Object,
} from "../controllers/imageUploadController.js";
const router = express.Router();

router.post("/s3Url", async (req, res) => {
  console.log(req.user);
  var presignedUrl = await createPresignedUrlWithClient(
    req.body.fileName,
    req.body.mimeType,
    req.user.bucketIdentifier
  );
  console.log(presignedUrl);
  res.send({ url: presignedUrl });
});

router.get("/analyzeExpense/:objectName", async (req, res) => {
  var textractResponse = await analyzeExpenseObject(req.params.objectName, req.user.bucketIdentifier);
  var expenseData = formatExpenseResponse(textractResponse);
  res.status(200).json(expenseData);
});

router.get('/s3Object/:objectName', getS3Object)
export { router };
