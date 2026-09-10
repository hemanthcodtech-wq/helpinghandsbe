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
    folder: 'helpinghands/testimonials',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage: storage });

// GET all testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await sql`
      SELECT * FROM testimonials ORDER BY created_at DESC
    `;
    res.json({ success: true, testimonials });
  } catch (error) {
    console.error('Fetch all testimonials error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST a new testimonial (with image upload)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, role, quote, rating } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = req.file.path;
    }

    const newTestimonial = await sql`
      INSERT INTO testimonials (name, role, quote, rating, image_url)
      VALUES (${name}, ${role}, ${quote}, ${rating || 5}, ${imageUrl})
      RETURNING *
    `;

    res.status(201).json({ success: true, testimonial: newTestimonial[0] });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ success: false, message: 'Failed to create testimonial' });
  }
});

// DELETE a testimonial
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the testimonial to delete the image from Cloudinary
    const testimonials = await sql`SELECT image_url FROM testimonials WHERE id = ${id}`;
    
    if (testimonials.length === 0) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const testimonial = testimonials[0];
    if (testimonial.image_url) {
      const publicId = testimonial.image_url.split('/').slice(-2).join('/').split('.')[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
      }
    }

    await sql`DELETE FROM testimonials WHERE id = ${id}`;
    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete testimonial' });
  }
});

module.exports = router;
