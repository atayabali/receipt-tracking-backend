import express from "express";
import { getExpenseSummaries } from "../controllers/summaryController.js";


//router object 
const summaryRouter = express.Router();

//Get All Expense Summaries
summaryRouter.get('/getAll', getExpenseSummaries)
// module.exports = router; 


export { summaryRouter }