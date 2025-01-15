
import {
  S3Client
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import * as FileSystem from 'fs';
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";

function getImageBufferForWeb(imageUri){
  //uri from web begins with data:image/png;base64, that needs to be removed before converted to buffer
  var extractedUri = imageUri.split(',')[1];
  return Buffer.from(extractedUri);
}

async function getImageBufferForMobile(imageUri){
  //uri from mobile begins with file:///var/mobile/Containers/Data/Application/B6366CCC-14A8-42DC-886E-58604DAD1496
  try {
    // Read the file from the local URI
    const fileContent = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Convert Base64 string to binary data
    return Buffer.from(fileContent, 'base64');
  } catch (error) {
    console.error('Error reading file:', error);
  }
}

export async function convertImageToStream(imageUri, platform) {
  var buffer = (platform === 'web') 
  ? getImageBufferForWeb(imageUri) 
  : await getImageBufferForMobile(imageUri);
  return buffer
}

function generateUniqueKey(){
  const uuid = randomUUID();
  return `${uuid}.png`;
}
export async function uploadImage(buffer, fileName, mimeType) {
  var bufferStream = new Readable();
  bufferStream.push(buffer); 
  bufferStream.push(null); 
  try {
    const upload = new Upload({
      client: new S3Client({ region: "us-east-1"}),
      params: { 
        Bucket: process.env.S3_BUCKET_NAME, 
        Key: generateUniqueKey(), 
        Body: bufferStream,
        ContentType: mimeType,
      }
    });

    const result = await upload.done(); 
    console.log("Result: ", result);
    return result.$metadata.httpStatusCode;
  } catch (e) {
    console.log(e);
  }
}
