require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const gallery = [
  "/images/gallery-1.png",
  "/images/gallery-2.png",
  "/images/gallery-3.png",
  "/images/gallery-4.png",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1494386346843-e12284507169?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1504159506876-f8338247a14a?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1559027615-028f8e3c5a5f?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1573497161079-f3fdc0a7b6f0?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1509099836639-18ba02c0c4c5?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=700&q=80"
];

async function seed() {
  const sql = neon(process.env.DATABASE_URL);
  console.log('Seeding resources table...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL,
      file_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const existing = await sql`SELECT id FROM resources WHERE category = 'photos' LIMIT 1`;
  if (existing.length > 0) {
    console.log('Photos already seeded. Skipping.');
    return;
  }
  
  for (let i = 0; i < gallery.length; i++) {
    const url = gallery[i];
    const title = 'Community Photo ' + (i + 1);
    await sql`
      INSERT INTO resources (title, description, category, file_url)
      VALUES (${title}, 'Moments from our community initiatives.', 'photos', ${url})
    `;
  }
  
  console.log('Successfully seeded ' + gallery.length + ' photos.');
}

seed().catch(console.error);
