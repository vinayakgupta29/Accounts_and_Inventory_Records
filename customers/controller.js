const { Customer } = require("./customerModel");
const {
  generateId,
  generateCustomerId,
} = require("../id_controller/id_generator");
const { check, query, validationResult } = require("express-validator");
const { cleanAlphanumeric } = require("../server-security/server-security");
let id = 1;
console.log("id : ", "cust_" + id.toString().padStart(3, "0"));
const customerRouter = require("express").Router();
customerRouter.post(
  "/add",
  [
    check("name").isString().trim().notEmpty().isAlphanumeric(),
    check("address").isString().trim().notEmpty().isAlphanumeric(),
    check("phone").isString().trim().notEmpty().isAlphanumeric(),
    check("email").isString().trim().notEmpty().isEmail(),
    check("gstIN").isString().trim().notEmpty().isAlphanumeric(),
    check("pan").isString().trim().notEmpty().isAlphanumeric(),
    check("aadhaar").isString().trim().notEmpty().isAlphanumeric(),
    check("dealer_type").isString().trim().isAlphanumeric(),
    check("username").isString().trim().notEmpty().isAlphanumeric(),
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

      await client.release(); // Release the client back to the pool

      res
        .status(201)
        .json({ message: "customer created successfully", customer: response });
    } catch (e) {
      console.error("Error creating customer:", e);

      // Rollback the transaction in case of an error
      await client.query("ROLLBACK");

      await client.release(); // Release the client back to the pool

      res.status(500).json({ error: "Internal server error" });
    }
  }
);

customerRouter.get(
  "/get",
  [
    query("username")
      .isString()
      .trim()
      .customSanitizer(cleanAlphanumeric)
      .isAlphanumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(422).json({ Errors: errors.array() });
    }
    const pool = req.pgPool;
    const username = req.query.username;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const response = (
        await client.query(
          `SELECT cust_id, name, address, phone_number, email, gstin, dealer_type, pan_card, aadhaar FROM ${username}_customers ;`
        )
      ).rows;
      // Commit the transaction
      await client.query("COMMIT");

      await client.release(); // Release the client back to the pool

      res.status(201).json({
        message: "customer fetched successfully",
        customers: response,
      });
    } catch (e) {
      console.error("Error fetching customer:", e);

      // Rollback the transaction in case of an error
      await client.query("ROLLBACK");

      await client.release(); // Release the client back to the pool

      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = customerRouter;
