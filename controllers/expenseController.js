import { getSqlPool } from "../db.js";

const mySqlPool = await getSqlPool();

export const getExpenses = async (req, res) => {
  var connection = await mySqlPool.getConnection();
  try {
    const data = await connection.query(
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
  } finally {
    connection.release();
  }
};

//Where did i need this again, maybe for postman testing
export const getExpenseById = async (req, res) => {
  var connection = await mySqlPool.getConnection();

  try {
    var expenseId = req.params.id;
    const data = await connection.query(
      `SELECT id, merchant, totalCost, date, hasSubItems FROM expenses WHERE id = ${expenseId}`
    );
    var summary = data[0];
    res.status(200).send(summary);
  } catch (error) {
    res.status(500).send(error);
  } finally {
    connection.release();
  }
};

export const postExpense = async (req, res) => {
  const subExpenseInsertSql = `INSERT INTO sub_expense (expenseId, name, cost, quantity) VALUES ?`;
  const expenseInsertSql = `INSERT INTO expenses (merchant, totalCost, date, hasSubItems) VALUES (?, ?, ?, ?)`;
  const expenseData = [[req.body.merchant], [req.body.totalCost], [req.body.expenseDate], [req.body.includeBreakdown]]
  var connection = await mySqlPool.getConnection();
  try {

    const [expenseRows] = await connection.query(expenseInsertSql, expenseData);
    var expenseId = expenseRows.insertId;
    if(req.body.includeBreakdown){
      var subExpenseData = req.body.subExpenses.map(subExpense => [[expenseId], [subExpense.name], [subExpense.cost], [subExpense.quantity]])
      const [subExpenseRows] = await connection.query(subExpenseInsertSql, [subExpenseData]);
    }
    res.status(200).send({expenseId}); 
  } catch (error) {
    res.status(500).send(error);
  } finally {
    connection.release();
  }
}; 

export const deleteExpense = async (req, res) => {
  const expenseGetSql = `SELECT EXISTS (SELECT * FROM expenses WHERE id = ?) AS doesExpenseExist`
  const deleteSubExpensesSql = `DELETE FROM sub_expense WHERE expenseId = ?`;
  const deleteExpenseSql = `DELETE FROM expenses WHERE id = ?`;
  var expenseId = req.params.id;
  var connection = await mySqlPool.getConnection();

  try {
    //Check Expense exists
    const data = await connection.query(expenseGetSql, expenseId);
    var response = data[0][0]
    if(response.doesExpenseExist){
      //Deleted SubExpenses and Expense
      const [deletedRows] = await connection.query(deleteSubExpensesSql, expenseId);
      const [deletedExpense] = await connection.query(deleteExpenseSql, expenseId);
      res.status(200).send({deletedId: expenseId});
    } else {
      res.sendStatus(404).send("Expense not found")
    }
  } catch (error) {
    res.status(500).send(error);
  } finally {
    connection.release();
  }
}; 