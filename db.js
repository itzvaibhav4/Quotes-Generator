import dotenv from "dotenv";

// Load .env only in local development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Render
  },
});

export default pool;
