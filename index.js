//AWS EXAMPLE CODE

// import { readFile } from "node:fs/promises";

// import {
//   PutObjectCommand,
//   S3Client,
//   S3ServiceException,
// } from "@aws-sdk/client-s3";

// /**
//  * Upload a file to an S3 bucket.
//  * @param {{ bucketName: string, key: string, filePath: string }}
//  */
// export const main = async ({ bucketName, key, filePath }) => {
//   const client = new S3Client({});
//   const command = new PutObjectCommand({
//     Bucket: bucketName,
//     Key: key,
//     Body: await readFile(filePath),
//   });

//   try {
//     const response = await client.send(command);
//     console.log(response);
//   } catch (caught) {
//     if (
//       caught instanceof S3ServiceException &&
//       caught.name === "EntityTooLarge"
//     ) {
//       console.error(
//         `Error from S3 while uploading object to ${bucketName}. \
// The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
// or the multipart upload API (5TB max).`,
//       );
//     } else if (caught instanceof S3ServiceException) {
//       console.error(
//         `Error from S3 while uploading object to ${bucketName}.  ${caught.name}: ${caught.message}`,
//       );
//     } else {
//       throw caught;
//     }
//   }
// };
















// // // This is used for getting user input.
// // import { createInterface } from "node:readline/promises";





// // export async function main() {
// //     // A region and credentials can be declared explicitly. For example
// //   // `new S3Client({ region: 'us-east-1', credentials: {...} })` would
// //   //initialize the client with those settings. However, the SDK will
// //   // use your local configuration and credentials if those properties
// //   // are not defined here.
 

// //   //I already have a bucket
// //   // Create an Amazon S3 bucket. The epoch timestamp is appended
// //   // to the name to make it unique.
// // //   const bucketName = `test-bucket-${Date.now()}`;
// // //   await s3Client.send(
// // //     new CreateBucketCommand({
// // //       Bucket: bucketName,
// // //     }),
// // //   );


// //   // Read the object.
// // //   const { Body } = await s3Client.send(
// // //     new GetObjectCommand({
// // //       Bucket: bucketName,
// // //       Key: "my-first-object.txt",
// // //     }),
// // //   );

// // //   console.log(await Body.transformToString());

// //   // Confirm resource deletion.
// // //   const prompt = createInterface({
// // //     input: process.stdin,
// // //     output: process.stdout,
// // //   });

// // //   const result = await prompt.question("Empty and delete bucket? (y/n) ");
// // //   prompt.close();

// // //   if (result === "y") {
// // //     // Create an async iterator over lists of objects in a bucket.
// // //     const paginator = paginateListObjectsV2(
// // //       { client: s3Client },
// // //       { Bucket: bucketName },
// // //     );
// // //     for await (const page of paginator) {
// // //       const objects = page.Contents;
// // //       if (objects) {
// // //         // For every object in each page, delete it.
// // //         for (const object of objects) {
// // //           await s3Client.send(
// // //             new DeleteObjectCommand({ Bucket: bucketName, Key: object.Key }),
// // //           );
// // //         }
// // //       }
// // //     }

// //     // Once all the objects are gone, the bucket can be deleted.
// //     // await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));
// // //   }
// // }

// // // Call a function if this file was run directly. This allows the file
// // // to be runnable without running on import.
// // import { fileURLToPath } from "node:url";
// // if (process.argv[1] === fileURLToPath(import.meta.url)) {
// //   main();
// // }
