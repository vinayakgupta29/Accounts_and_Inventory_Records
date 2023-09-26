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
module.exports = { generateCustomerId };
