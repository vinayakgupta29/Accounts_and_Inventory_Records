const express = require("express");
const port = 420;
const app = express();
const authRoute = require("./auth/controller");
const inventoryRoute = require("./inventory-management/controller");
const { pgPool } = require("./postgresql/dbconstants");
const { InvoiceLines } = require("./invoices/invoiveModels");
const invoiceRoute = require("./invoices/controller");
const customerRoute = require("./customers/controller");

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
app.use("/inventory", inventoryRoute);
app.use("/invoice", invoiceRoute);
app.use("/customer", customerRoute);
