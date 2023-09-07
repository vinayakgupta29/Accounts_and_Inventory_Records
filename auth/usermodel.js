const Users = {
  createTable: async function (client) {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        gstIn VARCHAR(100) NOT NULL,
        pan_card VARCHAR(50) NOT NULL,
        adhaar VARCHAR(50) NOT NULL,
        phone VARCHAR (12) NOT NULL,
        address VARCHAR(255) NOT NULL
    );`;
      await client.query(sql);
    } catch (e) {
      console.error("An error in Creating User table", e);
    }
  },

  insertRecord: async function (
    client,
    name,
    username,
    password,
    gstIn,
    phone,
    address,
    pan,
    adhaar
  ) {
    try {
      const sql = `INSERT INTO users (name, username, password, gstIn, pan_card, adhaar, phone, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
      await client.query(sql, [
        name,
        username,
        password,
        gstIn,
        phone,
        address,
        pan,
        adhaar,
      ]);
      console.log("User Created");
    } catch (e) {
      console.error("error in INserting to User Table", e);
    }
  },
};

module.exports = { Users };
