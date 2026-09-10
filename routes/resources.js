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
    folder: 'helpinghands/resources',
    // Allow various types of uploads
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'mp4', 'mov', 'avi']
  }
});
const upload = multer({ storage: storage });

// Create a new resource
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { category, title, description } = req.body;
    
    // File URL from cloudinary if uploaded
    const file_url = req.file ? req.file.path : null;

    if (!category || !title) {
      return res.status(400).json({ success: false, message: 'Category and Title are required' });
    }

    await sql`
      INSERT INTO resources (category, title, description, file_url)
      VALUES (${category}, ${title}, ${description || null}, ${file_url})
    `;

    res.json({ success: true, message: 'Resource added successfully' });
  } catch (error) {
    console.error('Resource upload error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all resources or by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let resources;
    if (category) {
      resources = await sql`SELECT * FROM resources WHERE category = ${category} ORDER BY id DESC`;
    } else {
      resources = await sql`SELECT * FROM resources ORDER BY id DESC`;
    }
    
    res.json({ success: true, resources });
  } catch (error) {
    console.error('Fetch resources error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete a resource
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await sql`DELETE FROM resources WHERE id = ${id}`;
    
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
