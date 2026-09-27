require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function addTest() {
  try {
    const coordId = 32; // We don't know a valid ID, let's select one
    const users = await sql`SELECT id FROM users WHERE role = 'coordinator' LIMIT 1`;
    if (users.length === 0) {
      console.log("No coordinators found");
      return;
    }
    const id = users[0].id;
    console.log("Found coordinator ID:", id);
    
    const result = await sql`
      INSERT INTO coordinator_collections (coordinator_id, name, mobile, email, amount)
      VALUES (${id}, 'Test Donor', '9999999999', 'test@test.com', 500)
      RETURNING *
    `;
    console.log("Inserted:", result);
  } catch (err) {
    console.error(err);
  }
}
addTest();
