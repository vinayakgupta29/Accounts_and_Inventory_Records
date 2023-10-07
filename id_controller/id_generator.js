const { Customer } = require("../customers/customerModel");
const { pgPool } = require("../postgresql/dbconstants");

async function generateCustomerId(client, username) {
  let id = await client.query(`SELECT id FROM ${username}_customers;`);
  let uniqueId;
  if (id.rowCount === 0) {
    uniqueId = (1).toString().padStart(3, "0");
  } else {
    uniqueId = (id.rowCount + 1).toString().padStart(3, "0");
  }
  return `cust_${uniqueId}`;
}

async function generateInvoiceId(client, username) {
  const date = new Date().toISOString();
  const date0 = date.replace(/[^0-9]/g, "");
  const response = await client.query(
    `SELECT date_time,transaction_id FROM ${username}_invoices ORDER BY date_time LIMIT 50;`
  );
  let date1 = date0;
  for (const i of response.rows) {
    let count = 0;
    const date2 = Date(i.date_time);
    if (date2 === date0) {
      date1 = parseFloat(date0.padEnd(23, "0")) + count;
      if (date1.toString() === i.transaction_id.subString(3)) {
        date1 += 1;
      }
      count++;
    }
  }
  return `txn_${date1}`;
}

module.exports = { generateCustomerId, generateInvoiceId };
