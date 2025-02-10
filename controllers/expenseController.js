import { mySqlPool } from "../db.js";

export const getExpenses = async (req, res) => {
  try {
    const data = await mySqlPool.query(
      `SELECT id
        ,merchant
        ,totalCost
        ,date
        ,hasSubItems 
      FROM expenses 
      ORDER BY date desc`
    );
    var expenses = data[0].map((row) => ({
      ...row,
      hasSubItems: new Boolean(row.hasSubItems),
      date: new Date(row.date).toLocaleDateString(), // Or use toLocaleString()
    }));
    res.status(200).send(expenses);
  } catch (error) {
    res.status(500).send(error);
  }
};

//Where did i need this again, maybe for postman testing
export const getExpenseById = async (req, res) => {
  try {
    var summaryId = req.params.id;
    const data = await mySqlPool.query(
      `SELECT id, merchant, totalCost, date, hasSubItems FROM expenses WHERE id = ${summaryId}`
    );
    var summary = data[0];
    res.status(200).send(summary);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const postExpense = async (req, res) => {
  try {
    console.log(req.body);
    await mySqlPool.execute(
      `INSERT INTO expenses 
      (merchant, totalCost, date, hasSubItems) 
      VALUES 
      ('${req.body.merchant}', 
      ${req.body.totalCost}, 
      '${req.body.expenseDate}', 
      ${req.body.hasSubItems})`
    );
    res.status(200).send();
  } catch (error) {
    res.status(500).send(error);
  }
};
