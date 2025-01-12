
import {
    S3Client
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fetch from "node-fetch";

export default async function uploadImageBlob(imageBlob, fileName) {
  try {
    const parallelUploads3 = new Upload({
      client: new S3Client({}),
      params: { 
        Bucket: process.env.S3_BUCKET_NAME,//`${bucketName}.s3express-zone-id.us-east-1.amazonaws.com', 
        Key: fileName, 
        Body: imageBlob 
      }
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(progress);
    });

    await parallelUploads3.done();
  } catch (e) {
    console.log(e);
  }
}

export default async function fetchImageAsBlob(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    var blob = await response.blob();
    console.log(blob);

    return blob;
  } catch (error) {
    console.error("Error fetching image:", error);
  }
}

// Put an object into an Amazon S3 bucket.
// await s3Client.send(
//   new PutObjectCommand({
//     Bucket: bucketName,
//     Key: "my-first-object.txt",
//     Body: "Hello JavaScript SDK!",
//   }),
// );
// });