const Invoice = {
  createTable: async function (client, username) {
    const sql = `CREATE TABLE IF NOT EXISTS ${username}_invoices (
    transaction_id VARCHAR(255) PRIMARY KEY,
    customer_id TEXT NOT NULL,
    date_time TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    total_discount DECIMAL(10,2) NOT NULL,
    packaging DECIMAL(10,2) NOT NULL,
    freight DECIMAL(10,2) NOT NULL,
    taxable_amount DECIMAL(10,2) NOT NULL,
    tax_collected_at_source DECIMAL(10,2) NOT NULL,
    round_off DECIMAL(10,2) NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    method_of_payment TEXT NOT NULL,

    FOREIGN KEY (customer_id) REFERENCES ${username}_customers (cust_id)
  );`;
    await client.query(sql);
  },
  insertRecord: async function (client, username, invoice) {
    const {
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
    } = invoice;
    const sql = `INSERT INTO ${username}_invoices (customer_id, transaction_id, date_time, total, total_discount, packaging, freight, taxable_amount, tax_collected_at_source, round_off, grand_total, method_of_payment)
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
  },
};

const InvoiceLines = {
  createTable: async function (client, username) {
    const sql = `CREATE TABLE IF NOT EXISTS ${username}_invoice_lines (
      id SERIAL PRIMARY KEY,
      invoice_id VARCHAR(256) NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (product_id) REFERENCES ${username}_inventory (id),
      FOREIGN KEY (invoice_id) REFERENCES ${username}_invoices (transaction_id)
    );`;
    await client.query(sql);
  },
  //      FOREIGN KEY (invoice_id) REFERENCES ${username}_invoices (id),

  insertRecord: async function (client, username, invoiceId, invoiceLine) {
    const { product_id, quantity, amount } = invoiceLine;
    const sql = `INSERT INTO ${username}_invoice_lines (invoice_id, product_id,  quantity,  amount)
    VALUES ($1, $2, $3, $4)`;
    await client.query(sql, [invoiceId, product_id, quantity, amount]);
  },
};

module.exports = { Invoice, InvoiceLines };
