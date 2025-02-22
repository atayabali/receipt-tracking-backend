import { getSqlPool } from "../db.js";

const mySqlPool = await getSqlPool();
export const getSubExpensesByExpenseId = async (req, res) => {
  var connection = await mySqlPool.getConnection();

  try {
    const data = await connection.query(
      `SELECT id, cost, quantity, name 
        FROM sub_expense
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

export const postSubExpense = async (req, res) => {
  const expenseGetSql = `SELECT EXISTS (SELECT * FROM expenses WHERE id = ?) AS doesExpenseExist`
  const subExpenseInsertSql = `INSERT INTO sub_expense (expenseId, name, cost, quantity) VALUES (?)`;
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
  const subExpenseGetSql = `SELECT EXISTS (SELECT * FROM sub_expense WHERE id = ?) AS doesExist`
  const subExpenseDeleteSql = `DELETE FROM sub_expense WHERE id = ?`;
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

// export const getExpenseById = async (req, res) => {
//   try {
//     var summaryId = req.params.id;
//     const data = await mySqlPool.query(
//       `SELECT id, merchant, totalCost, date, hasSubItems FROM expenses WHERE id = ${summaryId}`
//     );
//     var summary = data[0];
//     res.status(200).send(summary);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };

// export const postExpense = async (req, res) => {
//   try {
//     console.log(req.body);
//     await mySqlPool.execute(
//       `INSERT INTO expenses
//       (merchant, totalCost, date, hasSubItems)
//       VALUES
//       ('${req.body.merchant}',
//       ${req.body.totalCost},
//       '${req.body.expenseDate}',
//       ${req.body.hasSubItems})`
//     );
//     res.status(200).send();
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };
