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

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'helpinghands/programs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage: storage });

// GET all programs
router.get('/', async (req, res) => {
  try {
    const programs = await sql`SELECT * FROM programs ORDER BY id ASC`;
    res.json({ success: true, programs });
  } catch (error) {
    console.error('Fetch programs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST new program
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    let image_url = req.body.image_url;
    
    if (req.file) {
      image_url = req.file.path;
    }
    
    if (!title || !description || !tag) {
      return res.status(400).json({ success: false, message: 'Title, description and tag are required' });
    }

    await sql`
      INSERT INTO programs (title, description, image_url, tag)
      VALUES (${title}, ${description}, ${image_url || null}, ${tag})
    `;
    
    res.json({ success: true, message: 'Program created successfully' });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT update program
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tag } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
      image_url = req.file.path;
    }
    
    if (!title || !description || !tag) {
      return res.status(400).json({ success: false, message: 'Title, description and tag are required' });
    }

    if (image_url) {
      await sql`
        UPDATE programs 
        SET title = ${title}, description = ${description}, image_url = ${image_url}, tag = ${tag}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE programs 
        SET title = ${title}, description = ${description}, tag = ${tag}
        WHERE id = ${id}
      `;
    }
    
    res.json({ success: true, message: 'Program updated successfully' });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE program
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM programs WHERE id = ${id}`;
    res.json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
