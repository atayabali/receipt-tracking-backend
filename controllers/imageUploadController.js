import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  TextractClient,
  AnalyzeExpenseCommand,
} from "@aws-sdk/client-textract"; // ES Modules import
import { TextractExpense } from "amazon-textract-response-parser";

const textractClient = new TextractClient({ region: "us-east-1" });
// const bucketName = "image-upload-practice1";
export const analyzeExpenseObject = async (key, bucketIdentifier) => {
  const command = new AnalyzeExpenseCommand({
    Document: {
      S3Object: {
        Bucket: `receipts-${bucketIdentifier}`,
        Name: key,
      },
    },
  });
  try {
    const response = await textractClient.send(command);
    return response;
  } catch (error) {
    console.error("Error processing Textract:", error);
  }
};

export const formatExpenseResponse = (textractResponse) => {
  const expense = new TextractExpense(textractResponse);
  const expenseDoc = [...expense.iterDocs()][0];

  var merchant = expenseDoc.getSummaryFieldByType("VENDOR_NAME")?.value.text;
  var expenseDate = expenseDoc.getSummaryFieldByType("INVOICE_RECEIPT_DATE")
    ?.value.text;
  var totalPrice = expenseDoc.getSummaryFieldByType("AMOUNT_PAID")?.value.text;
  totalPrice = totalPrice.includes("$") ? totalPrice.split("$")[1] : totalPrice;

  const itemQuantities = {};
  const itemPrices = {};
  for (const group of expenseDoc.iterLineItemGroups()) {
    for (const item of group.iterLineItems()) {
      var itemName = item.getFieldByType("ITEM");
      if (itemName == null) continue;
      var itemNameText = itemName.value.text;
      var price = item.getFieldByType("PRICE")?.value.text;
      var itemCost = price.includes("$") ? price.split("$")[1] : price;

      itemPrices[itemNameText] = itemCost;

      if (itemNameText in itemQuantities) {
        itemQuantities[itemNameText]++;
      } else {
        itemQuantities[itemNameText] = 1;
      }
      var itemQnty = itemQuantities[itemNameText];
      console.log(`${itemNameText} costs ${itemCost} quantity ${itemQnty}`);
    }
  }

  var subItems = [];
  for (const key in itemPrices) {
    subItems.push({
      name: key,
      cost: parseFloat(itemPrices[key]),
      quantity: parseFloat(itemQuantities[key]),
    });
  }
  var data = {
    merchant: merchant,
    totalCost: parseFloat(totalPrice),
    expenseDate: new Date(expenseDate).toLocaleDateString(),
    hasSubItems: subItems.length > 0,
    subItems: subItems,
  };
  return data;
};

export async function createPresignedUrlWithClient(key, mimeType, bucketIdentifier) {
  const client = new S3Client({ region: "us-east-1" });
  const command = new PutObjectCommand({
    Bucket: `receipts-${bucketIdentifier}`,
    Key: key,
    ContentType: mimeType,
    // ACL: 'bucket-owner-full-control'
  });
  try {
    return await getSignedUrl(client, command, { expiresIn: 3600 });
  } catch (e) {
    console.log(e);
  }
}

export const getS3Object = async (req, res) => {
  const client = new S3Client({ region: "us-east-1" });
  const command = new GetObjectCommand({
    Bucket: `receipts-${req.user.bucketIdentifier}`,
    Key: req.params.objectName,
  })
  try {
    const data = await getSignedUrl(client, command, { expiresIn: 3600 });
    res.status(200).json({imageUri: data});
  } catch (error) {
    console.error("Error retrieving object:", error);
    res.status(500);
  }
}