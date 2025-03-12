import { getSqlPool } from "../db.js";
import queries from "../sqlQueries.json" with { type: "json" };

async function tryCatchWrapper(fn, next) {
  const mySqlPool = await getSqlPool();
  var connection = await mySqlPool.getConnection();
    try{
      await fn(connection);
    } catch (err){
      next(err);
    } finally {
      connection.release();
    }
}

export const getSubExpensesByExpenseId = async (req, res, next) => {
  async function getSubExpensesQuery(connection){
    const [rows] = await connection.query(
      queries.getSubExpensesByExpenseId, [req.params.expenseId]
    );
    res.send(rows);
  } 

  await tryCatchWrapper(getSubExpensesQuery, next);
};

export const getAllOrSearchSubExpenses = async (req, res, next) => {
  var getSql = queries.getSubExpensesWithDate;
  if(req.params.searchQuery){
    getSql = getSql + `WHERE name like '%${req.params.searchQuery}%' `
  }
  getSql = getSql + `ORDER BY date desc`
  async function getSubExpensesQuery(connection) {
    const [rows] = await connection.query(getSql);
    var subExpenses = rows.map((row) => ({
      ...row,
      date: new Date(row.date).toLocaleDateString(),
    }));
    res.send(subExpenses);
  } 
  await tryCatchWrapper(getSubExpensesQuery, next);
}

export const postSubExpense = async (req, res, next) => {
  var expenseId = req.body.expenseId;
  const subExpenseData = [[expenseId, req.body.name, req.body.cost, req.body.quantity]];

  async function postSubExpenseQuery(connection) {
    //Check Expense exists
    const [rows] = await connection.query(queries.checkExpenseExistence, expenseId);
    if(rows[0].doesExpenseExist){
      //Create SubExpense
      const [subExpenseRows] = await connection.query(queries.createSubExpenses, [subExpenseData]);
      var createdId = subExpenseRows.insertId;
      res.send({createdId});
    } else {
      const err = new Error("SubExpense cannot be created without an existing Expense");
      err.statusCode = 400;
      throw err;
    }
  }
  
  await tryCatchWrapper(postSubExpenseQuery, next)
}; 

export const deleteSubExpense = async(req, res, next) => {
  async function deleteSubExpQuery(connection) {
    var subExpenseId = req.params.subExpenseId;
    const data = await connection.query(queries.checkSubExpExistence, [subExpenseId]);
    var response = data[0][0];
    if(response.doesExist){
      const [subExpenseRows] = await connection.query(queries.deleteSubExpenseById, [subExpenseId]);
      res.status(200).send({subExpenseId});
    } else {
      throw new Error(`SubExpense not found`);
    }
  } 
  await tryCatchWrapper(deleteSubExpQuery, next)
}
