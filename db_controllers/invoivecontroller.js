const { Client } = require("pg");
const invoiceRouter = require("express").Router();

async function createCustomersTable(client, username) {
  const sql = `CREATE TABLE IF NOT EXISTS ${username}_customers (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gstIN VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (id)
  );`;
  await client.query(sql);
}

async function createInvoicesTable(client, customerName) {
  const sql = `CREATE TABLE IF NOT EXISTS ${customerName}_transaction (
    id INT NOT NULL AUTO_INCREMENT,
    customer_id INT NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    date_time DATETIME NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    method_of_payment VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (customer_id) REFERENCES ${username}_customers (id)
  );`;
  await client.query(sql);
}

async function createInvoiceLinesTable(client, transactionID) {
  const sql = `CREATE TABLE IF NOT EXISTS ${transactionID}_invoicelines (
    id INT NOT NULL AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    taxed_amount DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (invoice_id) REFERENCES ${customerName}_transaction (id)
  );`;
  await client.query(sql);
}

async function insertIntoCustomersTable(
  client,
  username,
  name,
  address,
  phone_number,
  email,
  gstIN
) {
  const sql = `INSERT INTO ${username}_customers (name, address, phone_number, email, gstIN) VALUES (?, ?, ?, ?, ?)`;
  const values = [name, address, phone_number, email, gstIN];
  await client.query(sql, values);
}

async function insertIntoInvoicesTable(
  client,
  customerName,
  customer_id,
  transaction_id,
  date_time,
  amount_paid,
  method_of_payment
) {
  const sql = `INSERT INTO ${customerName}_transaction (customer_id, transaction_id, date_time, amount_paid, method_of_payment) VALUES (?, ?, ?, ?, ?)`;
  const values = [
    customer_id,
    transaction_id,
    date_time,
    amount_paid,
    method_of_payment,
  ];
  await client.query(sql, values);
}

async function insertIntoInvoiceLinesTable(
  client,
  transactionID,
  invoice_id,
  product_id,
  product_name,
  price,
  quantity,
  amount,
  tax,
  taxed_amount
) {
  const sql = `INSERT INTO ${transactionID}_invoicelines (invoice_id, product_id, product_name, price, quantity, amount, tax, taxed_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    invoice_id,
    product_id,
    product_name,
    price,
    quantity,
    amount,
    tax,
    taxed_amount,
  ];
  await client.query(sql, values);
}

const main = async () => {
  const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "password",
    database: "my_database",
    port: 5432,
  });

  // await client.connect();
  // await createCustomersTable(client, "username");
  // await createInvoicesTable(client, "customerName");
  // await createInvoiceLinesTable(client, "transactionID");
  await client.end();
};

module.exports = {
  invoiceRouter,
  createCustomersTable,
  createInvoicesTable,
  createInvoiceLinesTable,
  insertIntoCustomersTable,
  insertIntoInvoicesTable,
  insertIntoInvoiceLinesTable,
};
