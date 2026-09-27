require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function updateSettings() {
  try {
    console.log('Fetching current settings...');
    const result = await sql`SELECT value FROM site_settings WHERE key = 'global'`;
    if (result.length > 0) {
      let currentSettings = result[0].value;
      
      // Update the fields properly
      currentSettings.contactPhonePrimary = '+91 7799373766';
      currentSettings.contactPhoneSecondary = '+91 7093426966';
      currentSettings.contactEmail = 'helpinghandsffoundation@gmail.com';
      currentSettings.contactHeadOffice = 'H.No: 4/211/2, SHAKTHI GUDI, ADONI 518301, ADONI MANDAL, KURNOOL DISTRICT, A.P.,';
      currentSettings.contactWorkingPresent = 'H.No: 4-187/4, AMBABHAVANI PET, GOWLI PET, ADONI 518301, ADONI MANDAL, KURNOOL DISTRICT, A.P.,';
      currentSettings.contactFullAddress = currentSettings.contactWorkingPresent; // fallback
      currentSettings.contactWorkingHours = 'Mon - Sat: 10:00 - 18:00'; // restore
      
      console.log('Updating settings...');
      await sql`
        UPDATE site_settings 
        SET value = ${JSON.stringify(currentSettings)}::jsonb 
        WHERE key = 'global'
      `;
      console.log('Settings fixed in database.');
    }
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

updateSettings();
