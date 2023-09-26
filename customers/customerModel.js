const Customer = {
  createTable: async function (client, username) {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS ${username}_customers (
        id SERIAL PRIMARY KEY,
        cust_id TEXT UNIQUE,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone_number VARCHAR(13) NOT NULL,
        email VARCHAR(255) NOT NULL,
        gstIN VARCHAR(255) NOT NULL UNIQUE,
        dealer_type VARCHAR(255) NOT NULL,
        pan_card VARCHAR(255) NOT NULL,
        aadhaar VARCHAR(255) NOT NULL
      );`;
      await client.query(sql);
    } catch (e) {
      console.error("Error creating Customer Table", e);
    }
  },

  insertRecord: async function (
    client,
    customer_id,
    name,
    address,
    phone_number,
    email,
    gstIN,
    dealer_type,
    pan,
    aadhaar,
    username
  ) {
    try {
      const sql = `INSERT INTO ${username}_customers (cust_id, name, address, phone_number, email, gstIN, dealer_type, pan_card, aadhaar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
      await client.query(sql, [
        customer_id,
        name,
        address,
        phone_number,
        email,
        gstIN,
        dealer_type,
        pan,
        aadhaar,
      ]);
    } catch (e) {
      console.error("Error inserting Customer", e);
    }
  },
};
module.exports = { Customer };
