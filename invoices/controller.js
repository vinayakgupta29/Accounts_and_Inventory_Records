const { Customer } = require("../customers/customerModel");
const { pgPool } = require("../postgresql/dbconstants");
const { Invoice, InvoiceLines } = require("./invoiveModels");

const invoiceRouter = require("express").Router();

invoiceRouter.post("/add", async (req, res) => {
  const pool = req.pgPool;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const username = req.body.username;
    const invoice = req.body.invoice;
    await Invoice.createTable(client, username);
    await Invoice.insertRecord(client, username, invoice);
    const invoiceLines = req.body.invoice.invoiceLines;
    for (let doc of invoiceLines) {
      const unit_price = (
        await client.query(
          `SELECT unit_price FROM ${username}_inventory WHERE id=$1;`,
          [doc.product_id]
        )
      ).rows[0];
      doc.amount = unit_price.unit_price * doc.quantity; // Access the unit_price value
      await InvoiceLines.createTable(client, username);
      await InvoiceLines.insertRecord(
        client,
        username,
        invoice.transaction_id,
        doc
      );
    }

    // Commit the transaction
    await client.query("COMMIT");

    client.release(); // Release the client back to the pool

    res
      .status(201)
      .json({ message: "invoice created successfully", invoice: invoice });
  } catch (e) {
    console.error("Error creating invoice:", e);

    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");

    client.release(); // Release the client back to the pool

    res.status(500).json({ error: "Internal server error" });
  }
});
async function customers(pool) {
  console.time("cust");
  const username = "vins";
  const client = await pool.connect();
  await client.query("BEGIN");
  await Customer.createTable(client, username);
  await Customer.insertRecord(
    client,
    "cust_001",
    "RAJ",
    "bhOPAL",
    "123456789789",
    "MAIL@MAIL.COM",
    "gst_123456789",
    "TT",
    "12345678",
    "1234567891232",
    username
  );
  console.log(
    (
      await client.query(
        `SELECT * FROM ${username}_customers WHERE id='cust_001';`
      )
    ).rows
  );
  console.timeEnd("cust");
}
module.exports = invoiceRouter;
