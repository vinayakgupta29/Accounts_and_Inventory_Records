require("dotenv").config();
const bcrypt = require("bcrypt");
const express = require("express");
const authRouter = express.Router();
const Pool = require("../db_controllers/dbconstants");
const Token = require("./middleware/tokenhandler");

const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,

    GSTIN VARCHAR(255) NOT NULL, 
    Phone VARCHAR(255) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

Pool.query(createUserTableQuery)
  .then(() => {
    console.log("User table created successfully");
  })
  .catch((error) => {
    console.error("Error creating user table:", error);
  });

authRouter.post("/signup", async (req, res) => {
  try {
    const newUser = {
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      gstin: req.body.gstin,
      phone: req.body.phone,
      address: req.body.address,
    };
    Pool.connect();

    // Check if the username already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [newUser.username]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    // Insert the new user into the database
    await pool.query(
      "INSERT INTO users (name, username, email, password, GSTIN, Phone, Address) VALUES ($1, $2, $3,$4,$5,$6,$7)",
      [
        newUser.name,
        newUser.username,
        newUser.email,
        hashedPassword,
        newUser.gstin,
        newUser.phone,
        newUser.address,
      ]
    );

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
    Pool.end();
  } catch (error) {
    Pool.end();
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const userResult = await Pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    const user = userResult.rows[0];

    // If the user does not exist
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare the entered password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If the passwords do not match
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Passwords match, user is authenticated
    res
      .status(200)
      .json({ message: "Login successful", token: Token.createToken() });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = authRouter;
