require("dotenv").config()
const { Pool } = require("@neondatabase/serverless")

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function seed() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        membership_tier VARCHAR(255),
        aadhaar VARCHAR(255),
        address TEXT,
        state VARCHAR(255),
        district VARCHAR(255),
        pincode VARCHAR(255),
        blood_group VARCHAR(10),
        profile_picture_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log("members table created successfully!")
  } catch (err) {
    console.error("Error creating members table:", err)
  } finally {
    pool.end()
  }
}

seed()
