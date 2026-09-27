require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS coordinator_collections (
        id SERIAL PRIMARY KEY,
        coordinator_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        amount NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Table created successfully");
  } catch (err) {
    console.error(err);
  }
}
setup();
