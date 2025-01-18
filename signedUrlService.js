import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

export async function createPresignedUrlWithClient(key, mimeType) {
  const client = new S3Client({ region: "us-east-1" });
  const command = new PutObjectCommand({ 
    Bucket: 'image-upload-practice1', 
    Key: key, 
    ContentType: mimeType
    // ACL: 'bucket-owner-full-control'
  });
  return await getSignedUrl(client, command, { expiresIn: 3600 });
};
