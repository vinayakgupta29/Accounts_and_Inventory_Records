const express = require("express");
const port = 420;
const app = express();
const authRoute = require("./auth/usercontroller");
const ctrl = require("./db_controllers/invoivecontroller");
app.listen(port, () => {
  console.log(`it's running on http://localhost:${port}`);
});

app.use(express.json());

app.use("/auth", authRoute);

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
