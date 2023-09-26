const { Router } = require("express");
const { Customer } = require("./customerModel");
const {
  generateId,
  generateCustomerId,
} = require("../id_controller/id_generator");
const { check, validationResult } = require("express-validator");
let id = 1;
console.log("id : ", "cust_" + id.toString().padStart(3, "0"));
const customerRouter = Router();
customerRouter.post(
  "/add",
  [
    check("name").isString().trim().notEmpty(),
    check("address").isString().trim().notEmpty(),
    check("phone").isString().trim().notEmpty(),
    check("email").isString().trim().notEmpty(),
    check("gstIN").isString().trim().notEmpty(),
    check("pan").isString().trim().notEmpty(),
    check("aadhaar").isString().trim().notEmpty(),
    check("dealer_type").isString().trim(),
    check("username").isString().trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(422).json({ Errors: errors.array() });
    }
    const pool = req.pgPool;
    const {
      name,
      address,
      phone,
      email,
      gstIN,
      dealer_type,
      pan,
      aadhaar,
      username,
    } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await Customer.createTable(client, username);
      const cust_id = await generateCustomerId(client, username);
      console.log("cust_id", cust_id);
      await Customer.insertRecord(
        client,
        cust_id,
        name,
        address,
        phone,
        email,
        gstIN,
        dealer_type,
        pan,
        aadhaar,
        username
      );
      const response = (
        await client.query(
          `SELECT * FROM ${username}_customers WHERE cust_id='${cust_id}';`
        )
      ).rows;
      // Commit the transaction
      await client.query("COMMIT");

      client.release(); // Release the client back to the pool

      res
        .status(201)
        .json({ message: "customer created successfully", customer: response });
    } catch (e) {
      console.error("Error creating customer:", e);

      // Rollback the transaction in case of an error
      await client.query("ROLLBACK");

      client.release(); // Release the client back to the pool

      res.status(500).json({ error: "Internal server error" });
    }
  }
);

customerRouter.get("/get", async (req, res) => {
  const pool = req.pgPool;
  const {
    name,
    address,
    phone,
    email,
    gstIN,
    dealer_type,
    pan,
    aadhaar,
    username,
  } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await Customer.createTable(client, username);
    await Customer.insertRecord(
      client,
      generat,
      name,
      address,
      phone,
      email,
      gstIN,
      dealer_type,
      pan,
      aadhaar,
      username
    );
    const response = (
      await client.query(`SELECT * FROM ${username}_customers ;`)
    ).rows;
    // Commit the transaction
    await client.query("COMMIT");

    client.release(); // Release the client back to the pool

    res
      .status(201)
      .json({ message: "customer created successfully", customer: response });
  } catch (e) {
    console.error("Error creating customer:", e);

    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");

    client.release(); // Release the client back to the pool

    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = customerRouter;
