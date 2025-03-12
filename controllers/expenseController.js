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

export const getExpenses = async (req, res, next) => {
  async function getExpensesQuery(connection){
    const [rows] = await connection.query(queries.getAllExpenses);
      var expenses = rows.map((row) => ({
        ...row,
        hasSubItems: new Boolean(row.hasSubItems),
        date: new Date(row.date).toLocaleDateString(), 
      }));
      res.send(expenses);
  }

  await tryCatchWrapper(getExpensesQuery, next);
};

export const getExpenseById = async (req, res, next) => {
  async function getExpenseByIdQuery(connection) {
    var expenseId = req.params.id;
    const [rows] = await connection.query(queries.getExpenseById, expenseId);
    console.log(rows);
    if(rows.length === 0){
      throw new Error("Expense not found");
    }
    res.send(rows);
  }

  await tryCatchWrapper(getExpenseByIdQuery, next);
};


export const postExpense = async (req, res, next) => {
  async function postExpenseQuery(connection) {
    const expenseData = [[req.body.merchant], [req.body.totalCost], [req.body.expenseDate], [req.body.includeBreakdown], [req.body.imageKey]]
    const [expenseRows] = await connection.query(queries.createExpense, expenseData);
    var expenseId = expenseRows.insertId;
    if(req.body.includeBreakdown){
      var subExpenseData = req.body.subExpenses.map(subExpense => [[expenseId], [subExpense.name], [subExpense.cost], [subExpense.quantity]])
      const [subExpenseRows] = await connection.query(queries.createSubExpenses, [subExpenseData]);
    }
    res.send({expenseId}); 
  } 

  await tryCatchWrapper(postExpenseQuery, next);
}; 

export const deleteExpense = async (req, res, next) => {
  var expenseId = req.params.id;
  async function deleteExpenseQuery(connection) {
    const [rows] = await connection.query(queries.checkExpenseExistence, expenseId);
    if(rows[0].doesExpenseExist){
      //Deleted SubExpenses and Expense
      const [deletedRows] = await connection.query(queries.deleteSubExpenses, expenseId);
      const [deletedExpense] = await connection.query(queries.deleteExpenseById, expenseId);
      res.send({deletedId: expenseId});
    } else {
      throw new Error("Expense not found");
    }
  } 
  await tryCatchWrapper(deleteExpenseQuery, next);
}; 