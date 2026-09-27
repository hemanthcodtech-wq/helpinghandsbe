require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const collections = await sql`SELECT * FROM coordinator_collections`;
  console.log("COLLECTIONS:", collections);
}
check();
