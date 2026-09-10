require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const UPCOMING = [
  { type: "event", date: "15 Sep 2026", title: "Community Health Camp", location: "Local Community Centre", text: "Free basic health screening, awareness sessions and wellness guidance for families." },
  { type: "event", date: "02 Oct 2026", title: "Gandhi Jayanti Service Drive", location: "Community Outreach Area", text: "A volunteer-led cleanliness, food distribution and community service initiative." },
  { type: "event", date: "14 Nov 2026", title: "Children's Education Day", location: "Helping Hands Learning Centre", text: "Learning activities, school-supply support and an inspiring day for children." },
];

const NEWS = [
  { type: "news", date: "20 Aug 2026", title: "Helping Hands expands community outreach", text: "Our volunteers are preparing new local outreach activities focused on education, health and community welfare." },
  { type: "news", date: "12 Aug 2026", title: "Volunteer network welcomes new members", text: "More community members have joined our volunteer network to support upcoming programs." },
  { type: "news", date: "28 Jul 2026", title: "Education support initiative begins", text: "A new presentation-phase initiative connects learning support with community participation." },
];

async function seed() {
  const sql = neon(process.env.DATABASE_URL);
  console.log('Creating events_news table...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS events_news (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL,
      title VARCHAR(255) NOT NULL,
      event_date VARCHAR(50) NOT NULL,
      location VARCHAR(255),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const existing = await sql`SELECT id FROM events_news LIMIT 1`;
  if (existing.length > 0) {
    console.log('Data already seeded. Skipping.');
    return;
  }
  
  console.log('Inserting events...');
  for (const item of [...UPCOMING, ...NEWS]) {
    await sql`
      INSERT INTO events_news (type, title, event_date, location, content)
      VALUES (${item.type}, ${item.title}, ${item.date}, ${item.location || null}, ${item.text})
    `;
  }
  
  console.log('Successfully seeded events and news.');
}

seed().catch(console.error);
