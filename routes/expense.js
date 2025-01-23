import express from "express";
import {
  getExpenseById,
  getExpenses,
} from "../controllers/expenseController.js";
const summaryRouter = express.Router(); //router object - mini app that lives inside main application.

//GET All Expense Summaries
summaryRouter.get("/all", getExpenses);

//GET individual summary by Id
summaryRouter.get("/:id", getExpenseById);

export { summaryRouter };
