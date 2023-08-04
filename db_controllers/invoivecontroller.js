const { Client } = require('pg');

const createCustomersTable = async (client, username) => {
  const sql = `CREATE TABLE IF NOT EXISTS ${username}_customers (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gstIN VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  );`;
  await client.query(sql);
};

const createInvoicesTable = async (client, customerName) => {
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
};

const createInvoiceLinesTable = async (client, transactionID) => {
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
};

const main = async () => {
  const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password: 'password',
    database: 'my_database',
    port: 5432,
  });

  await client.connect();
  await createCustomersTable(client, 'username');
  await createInvoicesTable(client, 'customerName');
  await createInvoiceLinesTable(client, 'transactionID');
  await client.end();
};

main();
