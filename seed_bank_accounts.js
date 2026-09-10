require("dotenv").config()
const { Pool } = require("@neondatabase/serverless")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function seed() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id SERIAL PRIMARY KEY,
        bank_name VARCHAR(255) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(255) NOT NULL,
        ifsc_code VARCHAR(255) NOT NULL,
        branch VARCHAR(255),
        qr_code_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("bank_accounts table created successfully!")
  } catch (err) {
    console.error("Error creating bank_accounts table:", err)
  } finally {
    pool.end()
  }
}

seed()
