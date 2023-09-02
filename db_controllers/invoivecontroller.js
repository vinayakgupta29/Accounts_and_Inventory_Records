async function createUsersTable(client) {
  const sql = `CREATE TABLE IF NOT EXISTS users(
    id INT NOT NULL AUTO_INCREMENT
    name VARCHAR(255) NOT NULL
    username VARCHAR(50) NOT NULL
    password VARCHAR(100) NOT NULL
  )`;
}

async function createCustomersTable(client) {
  const sql = `CREATE TABLE IF NOT EXISTS customers (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    gstIN VARCHAR(255) NOT NULL UNIQUE,
    dealer_type VARCHAR(255) NOT NULL,
    pan_card VARCHAR(255) NOT NULL,
    aadhaar VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
  
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );`;
  await client.query(sql);
}

async function createInvoicesTable(client, customerName) {
  const sql = `CREATE TABLE IF NOT EXISTS invoices (
    id INT NOT NULL AUTO_INCREMENT,
    customer_id INT NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    date_time DATETIME NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    total_discount DECIMAL(10,2) NOT NULL,
    packaging DECIMAL(10,2) NOT NULL,
    freight DECIMAL(10,2) NOT NULL,
    taxable_amount DECIMAL(10,2) NOT NULL,
    tax_collected_at_source DECIMAL(10,2) NOT NULL,
    round_off DECIMAL(10,2) NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    method_of_payment VARCHAR(25) NOT NULL,
  
    PRIMARY KEY (id),
    FOREIGN KEY (customer_id) REFERENCES customers (id)
  );`;
  await client.query(sql);
}

async function createInvoiceLinesTable(client, transactionID, customerName) {
  const sql = `CREATE TABLE IF NOT EXISTS invoice_lines (
    id INT NOT NULL AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
  
    PRIMARY KEY (id),
    FOREIGN KEY (invoice_id) REFERENCES invoices (id),
    FOREIGN KEY (product_id) REFERENCES inventory (id)
  );`;
  await client.query(sql);
}

async function createProductsTable(client, username) {
  const sql = `CREATE TABLE IF NOT EXISTS ${username}_inventory (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
  
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );`;
  await client.query(sql);
}


async function insertUser(client, name, username, password) {
  const sql = `INSERT INTO users (name, username, password) VALUES ($1, $2, $3)`;
  await client.query(sql, [name, username, password]);
}

async function insertCustomer(
  client,
  name,
  address,
  phone_number,
  email,
  gstIN,
  dealer_type,
  pan,
  aadhaar,
  user_id
) {
  const sql = `INSERT INTO customers (name, address, phone_number, email, gstIN, dealer_type, pan, aadhaar, user_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
  await client.query(sql, [
    name,
    address,
    phone_number,
    email,
    gstIN,
    dealer_type,
    pan,
    aadhaar,
    user_id,
  ]);
}

async function insertInvoice(
  client,
  customer_id,
  transaction_id,
  date_time,
  total,
  total_discount,
  packaging,
  freight,
  taxable_amount,
  tax_collected_at_source,
  round_off,
  grand_total,
  method_of_payment
) {
  const sql = `INSERT INTO invoices (customer_id, transaction_id, date_time, total, total_discount, packaging, freight, taxable_amount, tax_collected_at_source, round_off, grand_total, method_of_payment)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
  await client.query(sql, [
    customer_id,
    transaction_id,
    date_time,
    total,
    total_discount,
    packaging,
    freight,
    taxable_amount,
    tax_collected_at_source,
    round_off,
    grand_total,
    method_of_payment,
  ]);
}

async function insertInventory(
  client,
  user_id,
  product_name,
  quantity,
  unit_price
) {
  const sql = `INSERT INTO inventory (user_id, product_name, quantity, unit_price)
  VALUES ($1, $2, $3, $4)`;
  await client.query(sql, [user_id, product_name, quantity, unit_price]);
}

async function insertInvoiceLines(
  client,
  invoice_id,
  product_id,
  product_name,
  quantity,
  unit_price,
  amount
) {
  const sql = `INSERT INTO invoice_lines (invoice_id, product_id, product_name, quantity, unit_price, amount)
  VALUES ($1, $2, $3, $4, $5, $6)`;
  await client.query(sql, [
    invoice_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    amount,
  ]);
}

module.exports = {
  createUsersTable,
  createCustomersTable,
  createInvoicesTable,
  createInvoiceLinesTable,
  createProductsTable,
  insertCustomer,
  insertUser,
  insertInvoice,
  insertInvoiceLines,
  insertInventory,
};
