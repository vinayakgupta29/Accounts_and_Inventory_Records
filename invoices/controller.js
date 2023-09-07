const { pgPool } = require("../postgresql/dbconstants");
const { Invoice } = require("./invoiveModels");

const invoiceRouter = require("express").Router();

invoiceRouter.post("/add", async (req, res) => {
  try {
    const pool = pgPool;
    const invoice = req.body.invoice;
    await Invoice.createTable(pool, req.body.username);
  } catch (e) {
    console.error("INternal server error");
  }
});
