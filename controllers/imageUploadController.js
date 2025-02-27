import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  TextractClient,
  AnalyzeExpenseCommand,
} from "@aws-sdk/client-textract"; // ES Modules import

const textractClient = new TextractClient({ region: "us-east-1" });
const bucketName = "image-upload-practice1";
export const analyzeExpense = async (key) => {
  const command = new AnalyzeExpenseCommand({
    Document: {
      S3Object: {
        Bucket: bucketName,
        Name: key,
      },
    },
  });
  try {
    const response = await textractClient.send(command);
    return response;
  } catch (error) {
    console.error("Error processing Textract:", error);
    // res.status(500).json({ error: 'Error analyzing document' });
  }
};

export async function createPresignedUrlWithClient(key, mimeType) {
  const client = new S3Client({ region: "us-east-1" });
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: mimeType,
    // ACL: 'bucket-owner-full-control'
  });
  return await getSignedUrl(client, command, { expiresIn: 3600 });
}
