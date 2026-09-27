require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function updateDb() {
  try {
    await sql`ALTER TABLE coordinator_collections ADD COLUMN collection_date DATE`;
    console.log("Column collection_date added");
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log("Column already exists");
    } else {
      console.error(err);
    }
  }
}
updateDb();
