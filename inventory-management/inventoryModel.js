const Products = {
  createTable: async function (client, username) {
    const sql = `CREATE TABLE IF NOT EXISTS ${username}_inventory (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL);`;
    await client.query(sql);
  },
  insertRecord: async function (
    client,
    username,
    product_name,
    quantity,
    unit_price
  ) {
    const sql = `INSERT INTO ${username}_inventory ( product_name, quantity, unit_price)
      VALUES ($1, $2, $3)`;
    await client.query(sql, [product_name, quantity, unit_price]);
  },
};

module.exports = { Products };
