import express from "express";
import {
  getExpenseById,
  getExpenses,
  postExpense
} from "../controllers/expenseController.js";
const router = express.Router(); //router object - mini app that lives inside main application.

//GET All Expense Summaries
router.get("/all", getExpenses);

//GET individual summary by Id
router.get("/:id", getExpenseById);

//POST expense
router.post("/", postExpense);

export { router };
