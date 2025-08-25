import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // loads local.env in dev (ignored in production)

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // needed for Render PostgreSQL
  },
});

export default pool;
