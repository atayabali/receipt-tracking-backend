import express from "express";
import { getSubItemsByExpenseId } from "../controllers/subexpenseController.js";
const router = express.Router(); 

//GET individual summary by Id
router.get("/:expenseId", getSubItemsByExpenseId);

//POST expense
// router.post("/", postExpense);

export { router };
