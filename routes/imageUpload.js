import express from "express";
import { analyzeExpense, createPresignedUrlWithClient } from "../controllers/imageUploadController.js";
import { TextractExpense } from "amazon-textract-response-parser";
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
  var textractResponse = await analyzeExpense(req.params.objectName);
  const expense = new TextractExpense(textractResponse);
  const expenseDoc = [...expense.iterDocs()][0];
  
  
  var vendorName = expenseDoc.getSummaryFieldByType("VENDOR_NAME");
  var merchant = vendorName.value.text;
  console.log(merchant);

  var invoiceReceiptDate = expenseDoc.getSummaryFieldByType("INVOICE_RECEIPT_DATE");
  var expenseDate = invoiceReceiptDate.value.text;
  console.log(expenseDate);

  var amountPaid = expenseDoc.getSummaryFieldByType("AMOUNT_PAID");
  var totalPrice = amountPaid.value.text.split('$')[1];
  console.log(totalPrice);

const itemQuantity = {};
const itemPrices = {};
for (const group of expenseDoc.iterLineItemGroups()) {
  for (const item of group.iterLineItems()) {
    var itemName = item.getFieldByType('ITEM')
    var itemNameText = itemName.value.text;
    console.log(itemNameText);
    var price = item.getFieldByType('PRICE');
    var itemCost = price.value.text.split('$')[1];
    console.log(itemCost);
    itemPrices[itemNameText] = itemCost;

    var itemQnty = itemQuantity[itemNameText];
    if(itemQnty === undefined){
      itemQuantity[itemNameText] = 1;
    } else {
      itemQuantity[itemNameText] = itemQnty++;
    }
    // console.log(`Found line item with ${item.nFields} fields`);
    // for (const field of item.iterFields()) {
    //   // var item = field.
    // }
  }
}

var subItems = [];
for(const key in itemPrices){
  subItems.push({name: key, cost: itemPrices[key], quantity: itemQuantity[key]});
}
var data = {
  merchant: merchant,
  totalCost: totalPrice,
  expenseDate: new Date(expenseDate),
  hasSubItems: subItems.length > 0,
  subExpenses: subItems 
}
res.status(200).json(data);
});

export { router };
