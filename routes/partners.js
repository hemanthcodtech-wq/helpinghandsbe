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
    folder: 'helpinghands/partners',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg']
  }
});
const upload = multer({ storage: storage });

// GET all partners
router.get('/', async (req, res) => {
  try {
    const partners = await sql`
      SELECT * FROM partners ORDER BY created_at DESC
    `;
    res.json({ success: true, partners });
  } catch (error) {
    console.error('Fetch all partners error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST a new partner (with image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, type, website_url } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = req.file.path;
    }

    const newPartner = await sql`
      INSERT INTO partners (name, type, website_url, image_url)
      VALUES (${name}, ${type}, ${website_url || null}, ${imageUrl})
      RETURNING *
    `;

    res.status(201).json({ success: true, partner: newPartner[0] });
  } catch (error) {
    console.error('Create partner error:', error);
    res.status(500).json({ success: false, message: 'Failed to create partner' });
  }
});

// DELETE a partner
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the partner to delete the image from Cloudinary
    const partners = await sql`SELECT image_url FROM partners WHERE id = ${id}`;
    
    if (partners.length === 0) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    const partner = partners[0];
    if (partner.image_url) {
      const publicId = partner.image_url.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
      }
    }

    await sql`DELETE FROM partners WHERE id = ${id}`;
    res.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete partner' });
  }
});

module.exports = router;
