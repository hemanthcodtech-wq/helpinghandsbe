const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const sql = neon(process.env.DATABASE_URL);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for multiple fields
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'helpinghands/settings',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg', 'ico']
  }
});
const upload = multer({ storage: storage });

// GET global settings
router.get('/', async (req, res) => {
  try {
    const result = await sql`SELECT value FROM site_settings WHERE key = 'global'`;
    if (result.length > 0) {
      res.json({ success: true, settings: result[0].value });
    } else {
      res.json({ success: true, settings: {} });
    }
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT (update) global settings with potential file uploads
router.put('/', upload.fields([
  { name: 'headerLogo', maxCount: 1 },
  { name: 'footerLogo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'pwaIcon', maxCount: 1 }
]), async (req, res) => {
  try {
    // 1. Fetch existing settings
    const existingResult = await sql`SELECT value FROM site_settings WHERE key = 'global'`;
    let currentSettings = existingResult.length > 0 ? existingResult[0].value : {};

    // 2. Merge string/boolean updates from req.body
    let incomingSettings = {};
    if (req.body.settingsData) {
      try {
        incomingSettings = JSON.parse(req.body.settingsData);
      } catch(e) {
        // Fallback if not stringified
        incomingSettings = req.body;
      }
    } else {
      incomingSettings = req.body;
    }

    const updatedSettings = { ...currentSettings, ...incomingSettings };

    // 3. Process uploaded files and overwrite specific URL keys
    if (req.files) {
      if (req.files['headerLogo']) updatedSettings.headerLogoUrl = req.files['headerLogo'][0].path;
      if (req.files['footerLogo']) updatedSettings.footerLogoUrl = req.files['footerLogo'][0].path;
      if (req.files['favicon']) updatedSettings.faviconUrl = req.files['favicon'][0].path;
      if (req.files['pwaIcon']) updatedSettings.pwaIconUrl = req.files['pwaIcon'][0].path;
    }

    // 4. Save to database
    await sql`
      INSERT INTO site_settings (key, value)
      VALUES ('global', ${JSON.stringify(updatedSettings)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;

    res.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

module.exports = router;
