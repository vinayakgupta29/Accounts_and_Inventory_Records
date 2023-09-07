const { pgPool } = require("../postgresql/dbconstants");
const { Products } = require("./inventoryModel");

const inventoryRouter = require("express").Router();

inventoryRouter.post("/add", async (req, res) => {
  try {
    const newProduct = {
      username: req.body.username,
      product_name: req.body.product_name,
      quantity: req.body.quantity,
      unit_price: req.body.unit_price,
    };
    await Products.createTable(pgPool, newProduct.username);
    const result = await Products.insertRecord(
      pgPool,
      newProduct.username,
      newProduct.product_name,
      newProduct.quantity,
      newProduct.unit_price
    );

    res.status(200).json({ result: result, messge: "Product added" });
  } catch (e) {
    console.error("Error adding Products to table", e);
    res.status(500).json({ error: "Invernal server error" });
  }
});

module.exports = inventoryRouter;
