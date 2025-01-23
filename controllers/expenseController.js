import { mySqlPool } from "../db.js";

export const getExpenses = async (req, res) => {
  try {
    const data = await mySqlPool.query(
      "SELECT id, location, totalCost, date FROM expenses"
    );
    var summaries = data[0];
    res.status(200).send(summaries);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const getExpenseById = async (req, res) => {
  try {
    var summaryId = req.params.id;
    const data = await mySqlPool.query(
      `SELECT id, location, totalCost, date FROM expenses WHERE id = ${summaryId}`
    );
    var summary = data[0];
    res.status(200).send(summary);
  } catch (error) {
    res.status(500).send(error);
  }
};
