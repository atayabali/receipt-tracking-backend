import { getSqlPool } from "../db.js";

const mySqlPool = await getSqlPool();
export const getSubItemsByExpenseId = async (req, res) => {
  try {
    const data = await mySqlPool.query(
      `SELECT id, cost, quantity, name 
        FROM sub_expense
        WHERE expenseId = ${req.params.expenseId}`
    );
    var subExpenses = data[0];
    res.status(200).send(subExpenses);
  } catch (error) {
    res.status(500).send(error);
  }
};

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
