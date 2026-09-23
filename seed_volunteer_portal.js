require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedVolunteerPortal() {
  try {
    // 1. volunteer_activities
    await sql`
      CREATE TABLE IF NOT EXISTS volunteer_activities (
        id SERIAL PRIMARY KEY,
        volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        hours INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL
      )
    `;
    console.log('volunteer_activities table ensured.');

    // 2. volunteer_campaigns
    await sql`
      CREATE TABLE IF NOT EXISTS volunteer_campaigns (
        id SERIAL PRIMARY KEY,
        volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        campaign_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        role VARCHAR(100) NOT NULL
      )
    `;
    console.log('volunteer_campaigns table ensured.');

    // 3. volunteer_programs
    await sql`
      CREATE TABLE IF NOT EXISTS volunteer_programs (
        id SERIAL PRIMARY KEY,
        volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        program_name VARCHAR(255) NOT NULL,
        schedule VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL
      )
    `;
    console.log('volunteer_programs table ensured.');

    // 4. volunteer_certificates
    await sql`
      CREATE TABLE IF NOT EXISTS volunteer_certificates (
        id SERIAL PRIMARY KEY,
        volunteer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        issuer VARCHAR(255) NOT NULL
      )
    `;
    console.log('volunteer_certificates table ensured.');

    // Find the default volunteer to seed data for
    const users = await sql`SELECT id FROM users WHERE role = 'volunteer' LIMIT 1`;
    if (users.length > 0) {
      const volId = users[0].id;
      console.log(`Seeding data for volunteer ID: ${volId}`);

      // Seed Activities
      await sql`INSERT INTO volunteer_activities (volunteer_id, title, date, hours, status) VALUES 
        (${volId}, 'Education Camp – Delhi', '2024-05-15', 6, 'completed'),
        (${volId}, 'Health Camp – Noida', '2024-05-20', 8, 'upcoming'),
        (${volId}, 'Food Drive – Gurgaon', '2024-04-28', 4, 'completed')
      `;

      // Seed Campaigns
      await sql`INSERT INTO volunteer_campaigns (volunteer_id, campaign_name, date, status, role) VALUES 
        (${volId}, 'Winter Blanket Drive', '2024-12-01', 'Upcoming', 'Distributor'),
        (${volId}, 'Flood Relief Camp', '2024-08-15', 'Completed', 'Coordinator')
      `;

      // Seed Programs
      await sql`INSERT INTO volunteer_programs (volunteer_id, program_name, schedule, location, status) VALUES 
        (${volId}, 'Weekend Teaching', 'Saturdays 10 AM - 1 PM', 'Community Hall, Delhi', 'Active')
      `;

      // Seed Certificates
      await sql`INSERT INTO volunteer_certificates (volunteer_id, name, date, issuer) VALUES 
        (${volId}, 'Outstanding Volunteer Award', '2023-12-15', 'NGO Management'),
        (${volId}, 'Health Camp Participation', '2024-02-20', 'Medical Team')
      `;
      console.log('Dummy data seeded successfully.');
    } else {
      console.log('No volunteer user found. Skipping dummy data insertion.');
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedVolunteerPortal();
