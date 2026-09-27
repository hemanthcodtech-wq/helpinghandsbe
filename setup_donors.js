require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function setupDonors() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_donors (
        id SERIAL PRIMARY KEY,
        coordinator_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        aadhar_number VARCHAR(50) NOT NULL,
        amount_needed NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Table coordinator_donors created");
  } catch (err) {
    console.error(err);
  }
}
setupDonors();
