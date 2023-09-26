const { check, query, validationResult } = require("express-validator");
const { Customer } = require("../customers/customerModel");
const { generateInvoiceId } = require("../id_controller/id_generator");
const { pgPool } = require("../postgresql/dbconstants");
const {
  InvoiceActions,
  getAmount,
  formatISODate,
  renderGraph,
} = require("./ctrlFunc");
const { Invoice, InvoiceLines } = require("./invoiveModels");
const { cleanAlphanumeric } = require("../server-security/server-security");
const chartjs = require("chartjs");
const path = require("path");
const invoiceRouter = require("express").Router();

invoiceRouter.post("/add", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error(errors.array());
    return res.status(422).json({ Errors: errors.array() });
  }
  const pool = req.pgPool;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const username = req.body.username;
    const invoice = req.body.invoice;
    if (!invoice.date_time) {
      invoice.date_time = new Date();
    } else {
      invoice.date_time = invoice.date_time;
    }
    await Invoice.createTable(client, username);
    invoice.transaction_id = await generateInvoiceId(client, username);
    await Invoice.insertRecord(client, username, invoice);
    const invoiceLines = invoice.invoiceLines;
    await getAmount(client, username, invoice.transaction_id, invoiceLines);

    // Commit the transaction
    await client.query("COMMIT");

    await client.release(); // Release the client back to the pool

    res
      .status(201)
      .json({ message: "invoice created successfully", invoice: invoice });
  } catch (e) {
    console.error("Error creating invoice:", e);

    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");

    await client.release(); // Release the client back to the pool

    res.status(500).json({ error: "Internal server error" });
  }
});

invoiceRouter.get(
  "/get",
  [query("username").trim().customSanitizer(cleanAlphanumeric).isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(422).json({ Errors: errors.array() });
    }
    const pool = req.pgPool;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      let sdate;
      let endate;
      if (req.query.sdate && req.query.endate) {
        sdate = new Date(req.query.sdate).toISOString();
        endate = new Date(req.query.endate).toISOString();
      } else {
        sdate = new Date().toISOString();
        endate = new Date().toISOString();
      }
      const username = req.query.username;
      const action = req.query.action;
      const sql = `SELECT * FROM ${username}_invoices ${InvoiceActions[action](
        sdate,
        endate
      )};`;
      //`BETWEEN '${sdate}' AND '${endate}';`; // WHERE date_time BETWEEN ${sdate} AND ${endate}
      const response = await client.query(sql);
      const responseData = response.rows;
      for (let i = 0; i < responseData.length; i++) {
        const element = responseData[i];
        element.lines = [];
        //SQL Query to find the invoice lines of a given invoiceID;
        const sql1 = `SELECT p.product_name AS contents, p.unit_price, il.quantity, il.amount FROM ${username}_invoice_lines AS il
         JOIN ${username}_inventory AS p ON p.id = il.product_id
         WHERE il.invoice_id='${element.transaction_id}';`;
        const res = await client.query(sql1);
        element.lines.push(res.rows);
      }
      await client.query("COMMIT");
      await client.release();
      res.status(200).json({ invoices: responseData });
    } catch (e) {
      await client.query("ROLLBACK");
      await client.release();
      console.error("error Getting invoices", e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

invoiceRouter.get("/graph/data", async (req, res) => {
  const pool = req.pgPool;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const sql = `SELECT p.product_name AS item, p.unit_price, il.quantity as quantity, SUM(il.amount) as amount, 
  DATE_TRUNC('day',inv.date_time) AS date FROM vins_invoice_lines AS il 
  JOIN vins_inventory AS p ON p.id = il.product_id 
  JOIN vins_invoices AS inv ON il.invoice_id=inv.transaction_id 
  GROUP BY p.product_name, p.unit_price, il.amount, il.quantity, date 
  ORDER BY date;`;
    const { rows } = await client.query(sql);

    await client.query("COMMIT");
    const reqLabel = req.query.label;
    const chartData = rows;
    const html = renderGraph(chartData, reqLabel);
    res.send(html);
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: e });
    console.error("graph error", e);
  }
});

invoiceRouter.get("/graph/", async (req, res) => {
  res.setHeader("Content-Type", "text/HTML");
  res.sendFile(path.join(__dirname, "chart.html"));
});

//SQL Query to find the invoice lines of a given invoiceID;
//SELECT p.product_name AS contents, p.unit_price, il.quantity, il.amount FROM vins_invoice_lines AS il
//JOIN vins_inventory AS p ON p.id = il.product_id
// WHERE il.invoice_id='txn_002';

module.exports = invoiceRouter;
