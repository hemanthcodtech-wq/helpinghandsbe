require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      )
    `;
    console.log('Users table ensured.');

    // Prepare users
    const adminPassword = await bcrypt.hash('Admin@1234', 10);
    const volunteerPassword = await bcrypt.hash('Volunteer@1234', 10);

    // Insert Admin
    await sql`
      INSERT INTO users (email, password, role)
      VALUES ('admin@helpinghands.org', ${adminPassword}, 'admin')
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role
    `;
    console.log('Admin user seeded.');

    // Insert Volunteer
    await sql`
      INSERT INTO users (email, password, role)
      VALUES ('volunteer@helpinghands.org', ${volunteerPassword}, 'volunteer')
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role
    `;
    console.log('Volunteer user seeded.');

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
