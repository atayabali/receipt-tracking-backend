import express from "express";
import { createPresignedUrlWithClient } from "../controllers/imageUploadController.js";
const router = express.Router();

router.get("/", async (req, res) => {
  var presignedUrl = await createPresignedUrlWithClient(
    req.body.fileName,
    req.body.mimeType
  );
  res.send({ url: presignedUrl });
});

export { router };
