import { mySqlPool } from '../db.js';

//Get all expense summaries list
export const getExpenseSummaries = async (req, res) => {
  try {
    const data = await mySqlPool.query("SELECT * FROM  expense_summary");
    if (!data){
      return res.status(404)
        .send({ success: false, message: "No Records Found" });
    }
    console.log("confirmed");
    res.status(200)
      .send({ success: true, message: "All Expense Summary Records" , data});
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get expense summaries API",
      error,
    });
  }
};

