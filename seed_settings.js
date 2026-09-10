require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  try {
    console.log('Creating site_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL DEFAULT '{}'::jsonb
      )
    `;
    console.log('site_settings table created successfully.');

    // Initialize default global settings
    const defaultSettings = {
      siteTitle: 'Global Impact Foundation',
      siteSubtitle: 'Empowering Lives, Enriching Futures.',
      metaTitle: 'Global Impact Foundation | Education, Health, Women Empowerment, Social Welfare',
      metaAuthor: 'Global Impact Foundation',
      websiteUrl: 'https://sarvabhyudaya.org',
      metaKeywords: 'Sarv Abhyudaya Foundation, SAF, education, medical assistance',
      metaDescription: 'Sarv Abhyudaya Foundation is a registered non-profit organization...',
      organizationNameHindi: 'Global Impact Foundation',
      officialRegistrationInfo: 'Reg: UP/2026/012345 | PAN: AAAAA1234A',
      panCardNumber: 'AAATG1234F',
      authorizedSignatoryName: 'Dr. Rajesh Kumar',
      authorizedSignatoryTitle: 'Chairman',
      googleAnalyticsCode: '',
      facebookPixelCode: '',
      googleSearchConsoleVerification: '',
      facebookUrl: 'https://www.facebook.com/',
      instagramUrl: 'https://www.instagram.com/',
      youtubeUrl: 'https://www.youtube.com/',
      linkedinUrl: 'https://www.linkedin.com/',
      pwaEnable: false,
      pwaAppName: 'Global Impact NGO',
      pwaShortName: 'GlobalImpact',
      contactEmail: 'foundationsarvabhyudaya@gmail.com',
      contactPhonePrimary: '+91 9818398199',
      contactPhoneSecondary: '+91-98765-43210',
      contactWorkingHours: 'Mon - Sat: 10:00 - 18:00',
      contactFullAddress: 'C-42, First Floor, Jawahar Park, Khanpur, New Delhi – 110062',
      googleMapEmbedUrl: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3589.0453698084593!2d84.0500445!3d25.900879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399269b39fea4e19%3A0xd74dff6514faf906!2sOnline%20Growth%20Hub!5e0!3m2!1sen!2sin!4v1778880314713!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
      headerLogoUrl: '',
      footerLogoUrl: '',
      faviconUrl: '',
      pwaIconUrl: ''
    };

    console.log('Inserting default settings...');
    await sql`
      INSERT INTO site_settings (key, value) 
      VALUES ('global', ${JSON.stringify(defaultSettings)}::jsonb)
      ON CONFLICT (key) DO NOTHING
    `;
    console.log('Default settings seeded successfully.');

  } catch (error) {
    console.error('Error updating database schema:', error);
  }
}

seed();
