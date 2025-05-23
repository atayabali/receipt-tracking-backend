import express from "express";
import { deleteSubExpense, getSubExpensesByExpenseId, getAllOrSearchSubExpenses, postSubExpense } from "../controllers/subexpenseController.js";
const router = express.Router(); 

//GET all subitems of expense by ExpenseId
router.get("/byexpense/:expenseId", getSubExpensesByExpenseId);

//GET All subitems with search param/filter 
router.get("/all/:searchQuery?", getAllOrSearchSubExpenses);

//TO DO: add userId/access token to check if expense belongs to user
router.post("", postSubExpense);

//TO DO: add userId/access token to check if expense belongs to user
router.delete("/:subExpenseId", deleteSubExpense);

export { router };
