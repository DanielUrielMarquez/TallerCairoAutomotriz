const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || "";
const forceSsl =
  process.env.NODE_ENV === "production" ||
  connectionString.includes("render.com") ||
  process.env.PGSSL === "true";

const pool = new Pool({
  connectionString,
  ssl: forceSsl ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
