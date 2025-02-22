import express from "express";
import { deleteSubExpense, getSubExpensesByExpenseId, postSubExpense } from "../controllers/subexpenseController.js";
const router = express.Router(); 

//GET individual summary by Id
router.get("/:expenseId", getSubExpensesByExpenseId);

router.post("", postSubExpense);

router.delete("/:subExpenseId", deleteSubExpense);
//POST expense
// router.post("/", postExpense);

export { router };
