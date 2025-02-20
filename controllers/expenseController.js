import { awsSqlPool, localSqlPool } from "../db.js";

const mySqlPool = true ? awsSqlPool : localSqlPool;

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
  const subItemInsertSql = `INSERT INTO sub_expense (expenseId, name, cost, quantity) VALUES ?`;
  const expenseInsertSql = `INSERT INTO expenses (merchant, totalCost, date, hasSubItems) VALUES (?, ?, ?, ?)`;
  const expenseData = [[req.body.merchant], [req.body.totalCost], [req.body.expenseDate], [req.body.includeBreakdown]]
  var connection = await mySqlPool.getConnection();
  try {
    const [expenseRows] = await connection.query(expenseInsertSql, expenseData);
    var expenseId = expenseRows.insertId;
    if(req.body.includeBreakdown){
      var subItemsData = req.body.subItems.map(subItem => [[expenseId], [subItem.name], [subItem.cost], [subItem.quantity]])
      const [subExpenseRows] = await connection.query(subItemInsertSql, [subItemsData]);
    }
    res.status(200).send({expenseId}); 
  } catch (error) {
    res.status(500).send(error);
  }
};
