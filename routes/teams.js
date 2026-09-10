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
    folder: 'helpinghands/teams',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage: storage });

// GET all team members (For Admin)
router.get('/', async (req, res) => {
  try {
    const members = await sql`
      SELECT * FROM team_members ORDER BY created_at DESC
    `;
    res.json({ success: true, members });
  } catch (error) {
    console.error('Fetch all teams error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET team members by group (For Public UI)
router.get('/:group', async (req, res) => {
  try {
    const { group } = req.params;
    const members = await sql`
      SELECT * FROM team_members 
      WHERE group_name = ${group} AND is_visible = true
      ORDER BY id ASC
    `;
    res.json({ success: true, members });
  } catch (error) {
    console.error('Fetch group teams error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST new team member
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, role, group_name, email, is_visible } = req.body;
    let image_url = null;
    
    if (req.file) {
      image_url = req.file.path;
    }
    
    if (!name || !role || !group_name) {
      return res.status(400).json({ success: false, message: 'Name, role, and group_name are required' });
    }

    const visible = is_visible === 'true' || is_visible === true;

    await sql`
      INSERT INTO team_members (name, role, group_name, image_url, email, is_visible)
      VALUES (${name}, ${role}, ${group_name}, ${image_url}, ${email || null}, ${visible})
    `;
    
    res.json({ success: true, message: 'Team member added successfully' });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT update team member
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, group_name, email, is_visible } = req.body;
    let image_url = null;

    if (req.file) {
      image_url = req.file.path;
    }
    
    if (!name || !role || !group_name) {
      return res.status(400).json({ success: false, message: 'Name, role, and group_name are required' });
    }

    const visible = is_visible === 'true' || is_visible === true;

    if (image_url) {
      await sql`
        UPDATE team_members 
        SET name = ${name}, role = ${role}, group_name = ${group_name}, image_url = ${image_url}, email = ${email || null}, is_visible = ${visible}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE team_members 
        SET name = ${name}, role = ${role}, group_name = ${group_name}, email = ${email || null}, is_visible = ${visible}
        WHERE id = ${id}
      `;
    }
    
    res.json({ success: true, message: 'Team member updated successfully' });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE team member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM team_members WHERE id = ${id}`;
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
