const express = require("express");
const port = 420;
const app = express();
const authRoute = require("./auth/usercontroller");
const inventoryRouter = require("./inventory-management/inventoryController");
const { pgPool } = require("./postgresql/dbconstants");
const { InvoiceLines } = require("./invoices/invoiveModels");
app.listen(port, () => {
  console.log(`it's running on http://localhost:${port}`);
});

app.use(express.json());
// Express middleware to use the pool in your routes
app.use((req, res, next) => {
  req.pgPool = pgPool; // Attach the pool to the request object
  next();
});
app.use("/auth", authRoute);
app.use("/inventory", inventoryRouter);

const result = pgPool.query(
  ` SELECT vins_invoice_lines.*,vins_inventory.product_name,vins_inventory.unit_price
   FROM vins_invoice_lines 
   JOIN vins_inventory 
   ON vins_invoice_lines.product_id = vins_inventory.id;`,
  (err, res) => {
    if (err) {
      console.error("Error executing query:", err);
      return;
    }
    if (!res || !res.rows) {
      console.error("No rows found in the query result.");
      return;
    }
    // Map the result rows to JSON objects
    const jsonResult = res.rows.map((row) => ({
      invoiceLineId: row.invoice_id, 
      product_name: row.product_name,
      unit_price: row.unit_price,
    }));

    console.log("json", jsonResult);
    return jsonResult;
  }
);
console.log(result);
// Handle POST request to insert an invoice
app.post("/insertInvoice", (req, res) => {
  const { custName, gstIN, Invoice } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      res.status(500).json({ error: "Failed to connect to the database" });
    } else {
      connection.beginTransaction(async (transactionError) => {
        if (transactionError) {
          connection.release();
          res.status(500).json({ error: "Transaction initialization error" });
        } else {
          try {
            // Insert into customers table
            await insertIntoCustomersTable(
              connection,
              custName,
              "",
              "",
              "",
              "",
              gstIN
            );

            // Insert into invoices table
            const { insertId: customer_id } = await insertIntoInvoicesTable(
              connection,
              custName,
              0, // Default values for customer_id and transaction_id
              "", // These values should be generated or provided in the JSON
              Invoice.date,
              Invoice.amount,
              Invoice.paymentmode
            );

            // Insert into invoice lines table for each item
            for (const item of Invoice.invoiceitems) {
              await insertIntoInvoiceLinesTable(
                connection,
                customer_id,
                0, // Default value for invoice_id
                0, // Default value for product_id
                item.itemName,
                item.rate,
                item.qty,
                item.rate * item.qty,
                0, // Default value for tax
                0 // Default value for taxed_amount
              );
            }

            connection.commit();
            connection.release();
            res.status(200).json({ message: "Invoice inserted successfully" });
          } catch (insertError) {
            connection.rollback();
            connection.release();
            res.status(500).json({ error: "Invoice insertion error" });
          }
        }
      });
    }
  });
});
