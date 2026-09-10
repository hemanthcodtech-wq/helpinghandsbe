const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const sql = neon(process.env.DATABASE_URL);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'helpinghands/events_news',
    allowed_formats: ['jpg', 'png', 'jpeg']
  }
});
const upload = multer({ storage: storage });

router.get('/', async (req, res) => {
  try {
    const events = await sql`SELECT * FROM events_news ORDER BY id DESC`;
    res.json({ success: true, events });
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ success: false, message: 'Upload error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { type, title, event_date, location, content } = req.body;
    
    if (!type || !title || !event_date || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const image_url = req.file ? req.file.path : null;

    const newEvent = await sql`
      INSERT INTO events_news (type, title, event_date, location, content, image_url)
      VALUES (${type}, ${title}, ${event_date}, ${location || null}, ${content}, ${image_url})
      RETURNING *
    `;
    
    res.json({ success: true, event: newEvent[0] });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM events_news WHERE id = ${id}`;
    res.json({ success: true, message: 'Event/News deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
