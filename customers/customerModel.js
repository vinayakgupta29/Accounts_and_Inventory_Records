const Customers = {
  createTable: async function (client, username) {
    const sql = `CREATE TABLE IF NOT EXISTS ${username}_customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        gstIN VARCHAR(255) NOT NULL UNIQUE,
        dealer_type VARCHAR(255) NOT NULL,
        pan_card VARCHAR(255) NOT NULL,
        aadhaar VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`;
    await client.query(sql);
  },

  insertRecord: async function (
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

    module.exports = { Customers };
  },
};
