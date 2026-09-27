require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function updateSettings() {
  try {
    console.log('Fetching current settings...');
    const result = await sql`SELECT value FROM site_settings WHERE key = 'global'`;
    if (result.length > 0) {
      let currentSettings = result[0].value;
      
      // Update the fields the user requested
      currentSettings.contactPhonePrimary = '+91 7799373766';
      currentSettings.contactPhoneSecondary = '+91 7093426966';
      currentSettings.contactEmail = 'helpinghandsffoundation@gmail.com';
      currentSettings.contactFullAddress = 'H.No: 4/211/2, SHAKTHI GUDI, ADONI 518301, ADONI MANDAL, KURNOOL DISTRICT, A.P.,';
      currentSettings.contactWorkingHours = 'H.No: 4-187/4, AMBABHAVANI PET, GOWLI PET, ADONI 518301, ADONI MANDAL, KURNOOL DISTRICT, A.P.,'; // the user said "Working present" is this address
      
      console.log('Updating settings...');
      await sql`
        UPDATE site_settings 
        SET value = ${JSON.stringify(currentSettings)}::jsonb 
        WHERE key = 'global'
      `;
      console.log('Settings updated successfully in database.');
    } else {
      console.log('No global settings found to update.');
    }
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

updateSettings();
