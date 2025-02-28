import express from "express";
import {
  analyzeExpenseObject,
  createPresignedUrlWithClient,
  formatExpenseResponse,
} from "../controllers/imageUploadController.js";
const router = express.Router();

router.post("/getSignedUrl", async (req, res) => {
  var presignedUrl = await createPresignedUrlWithClient(
    req.body.fileName,
    req.body.mimeType
  );
  console.log(presignedUrl);
  res.send({ url: presignedUrl });
});

router.get("/analyzeExpense/:objectName", async (req, res) => {
  var textractResponse = await analyzeExpenseObject(req.params.objectName);
  var expenseData = formatExpenseResponse(textractResponse);
  res.status(200).json(expenseData);
});

export { router };
