const { pgPool } = require("../postgresql/dbconstants");
const { Products } = require("./inventoryModel");

const inventoryRouter = require("express").Router();

inventoryRouter.post("/add", async (req, res) => {
  const pool = pgPool;
  const client = await pool.connect();
  try {
    const { username, product_name, quantity, unit_price } = req.body;
    await client.query("BEGIN");
    await Products.createTable(pgPool, username);
    const result = await Products.insertRecord(
      pgPool,
      username,
      product_name,
      quantity,
      unit_price
    );
    await client.query("COMMIT");

    client.release();
    res.status(200).json({ result: result, messge: "Product added" });
  } catch (e) {
    console.error("Error adding Products to table", e);
    await client.query("ROLLBACK");

    client.release();
    res.status(500).json({ error: "Invernal server error" });
  }
});

module.exports = inventoryRouter;
