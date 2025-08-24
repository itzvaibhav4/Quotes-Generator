// createTable.js
import pool from "./db.js";

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL
      );
    `);
    console.log("✅ Users table created successfully");
  } catch (err) {
    console.error("❌ Error creating table:", err);
  } finally {
    pool.end();
  }
}

createTable();
