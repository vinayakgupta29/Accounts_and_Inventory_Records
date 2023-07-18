const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "v7i#N#s16@3",
  port: 5432, // Default PostgreSQL port is 5432
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
    pool.end(); // Close the database connection
  })
  .catch((error) => {
    console.error("Error creating user table:", error);
    pool.end(); // Close the database connection
  });
