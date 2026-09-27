require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
async function check() {
  try {
    const res = await sql`SELECT id, email, name, blood_group FROM users WHERE role = 'coordinator' LIMIT 5`;
    console.log(res);
  } catch(e) {
    console.error(e);
  }
}
check();
