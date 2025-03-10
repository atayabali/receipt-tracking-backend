import { getSqlPool } from "../db.js";

const mySqlPool = await getSqlPool();
export const getSubExpensesByExpenseId = async (req, res) => {
  var connection = await mySqlPool.getConnection();

  try {
    const data = await connection.query(
      `SELECT id, cost, quantity, name 
        FROM sub_expenses
        WHERE expenseId = ${req.params.expenseId}`
    );
    var subExpenses = data[0];
    res.status(200).send(subExpenses);
  } catch (error) {
    res.status(500).send(error);
  } finally {
    connection.release();
  }
};

export const getAllOrSearchSubExpenses = async (req, res) => {
  var connection = await mySqlPool.getConnection();
  var getSql = `SELECT name, cost, date 
                FROM sub_expenses se 
                JOIN expenses ex ON se.expenseId = ex.id `
  if(req.params.searchQuery){
    getSql = getSql + `WHERE name like '%${req.params.searchQuery}%' `
  }
  getSql = getSql + `ORDER BY date desc`
  try {
    const data = await connection.query(getSql);
    var subExpenses = data[0].map((row) => ({
      ...row,
      date: new Date(row.date).toLocaleDateString(),
    }));
    res.status(200).send(subExpenses);
  } catch (error) {
    res.status(500).send(error);
  } finally {
    connection.release();
  }
}

export const postSubExpense = async (req, res) => {
  const expenseGetSql = `SELECT EXISTS (SELECT * FROM expenses WHERE id = ?) AS doesExpenseExist`
  const subExpenseInsertSql = `INSERT INTO sub_expenses (expenseId, name, cost, quantity) VALUES (?)`;
  var expenseId = req.body.expenseId;
  const subExpenseData = [expenseId, req.body.name, req.body.cost, req.body.quantity];
  var connection = await mySqlPool.getConnection();

  try {
    //Check Expense exists
    const data = await connection.query(expenseGetSql, expenseId);
    var response = data[0][0]
    if(response.doesExpenseExist){
      //Create SubExpense
      const [subExpenseRows] = await connection.query(subExpenseInsertSql, [subExpenseData]);
      var createdId = subExpenseRows.insertId;
      res.status(200).send({createdId});
    } else {
      res.sendStatus(400).send("SubExpense cannot be created with an existing Expense")
    }
  } catch (error) {
    res.status(500).send(error);
  } finally {
    connection.release();
  }
}; 

export const deleteSubExpense = async(req, res) => {
  const subExpenseGetSql = `SELECT EXISTS (SELECT * FROM sub_expenses WHERE id = ?) AS doesExist`
  const subExpenseDeleteSql = `DELETE FROM sub_expenses WHERE id = ?`;
  var connection = await mySqlPool.getConnection();
  try {
    var subExpenseId = req.params.subExpenseId;
    const data = await connection.query(subExpenseGetSql, [subExpenseId]);
    var response = data[0][0];
    if(response.doesExist){
      const [subExpenseRows] = await connection.query(subExpenseDeleteSql, [subExpenseId]);
      res.status(200).send({subExpenseId});
    } else {
      res.status(404).send(`SubExpense not found`);
    }
  } catch (error) {
    res.status(500).send(error);
  } finally {
    connection.release();
  }
}
