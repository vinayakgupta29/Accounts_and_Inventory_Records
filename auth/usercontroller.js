const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const express = require("express");
const authRouter = express.Router();
require("dotenv").config();

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT, // Default PostgreSQL port is 5432
});

const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool
  .query(createUserTableQuery)
  .then(() => {
    console.log("User table created successfully");
  })
  .catch((error) => {
    console.error("Error creating user table:", error);
  });
authRouter.post("/signup", async (req, res) => {
  try {
    const newUser = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };
    pool.connect();

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
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [newUser.username, newUser.email, hashedPassword]
    );

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
    pool.end();
  } catch (error) {
    pool.end();
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user exists
    const userResult = await pool.query(
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
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = authRouter;
