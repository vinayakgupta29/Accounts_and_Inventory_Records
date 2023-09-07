const { Pool } = require("pg");
const pgPool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT, // Default PostgreSQL port is 5432
});

module.exports = { pgPool };
