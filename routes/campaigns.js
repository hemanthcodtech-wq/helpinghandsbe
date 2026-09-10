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
    folder: 'helpinghands/campaigns',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage: storage });

// GET all campaigns with dynamically calculated raised amount
router.get('/', async (req, res) => {
  try {
    const campaigns = await sql`
      SELECT 
        c.id, c.name, c.text, c.image, c.target_amount, c.created_at,
        COALESCE(SUM(CAST(d.amount AS INTEGER)), 0) as raised_amount
      FROM campaigns c
      LEFT JOIN donations d ON c.id = d.campaign_id AND d.status = 'success'
      GROUP BY c.id
      ORDER BY c.id ASC
    `;
    
    const enriched = campaigns.map(c => {
      const target = c.target_amount || 1;
      let percentage = Math.round((c.raised_amount / target) * 100);
      if (percentage > 100) percentage = 100;
      return {
        ...c,
        raised: percentage,
        goal: '₹' + target.toLocaleString('en-IN')
      };
    });

    res.json({ success: true, campaigns: enriched });
  } catch (error) {
    console.error('Fetch campaigns error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET single campaign by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campaigns = await sql`
      SELECT 
        c.id, c.name, c.text, c.image, c.target_amount, c.created_at,
        COALESCE(SUM(CAST(d.amount AS INTEGER)), 0) as raised_amount
      FROM campaigns c
      LEFT JOIN donations d ON c.id = d.campaign_id AND d.status = 'success'
      WHERE c.id = ${id}
      GROUP BY c.id
    `;
    
    if (campaigns.length === 0) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const c = campaigns[0];
    const target = c.target_amount || 1;
    let percentage = Math.round((c.raised_amount / target) * 100);
    if (percentage > 100) percentage = 100;
    
    c.raised = percentage;
    c.goal = '₹' + target.toLocaleString('en-IN');

    res.json({ success: true, campaign: c });
  } catch (error) {
    console.error('Fetch campaign error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET donors for a specific campaign
router.get('/:id/donors', async (req, res) => {
  try {
    const { id } = req.params;
    const donors = await sql`
      SELECT id, name, email, phone, amount, date, status, txn_id 
      FROM donations 
      WHERE campaign_id = ${id} AND status = 'success'
      ORDER BY date DESC
    `;
    res.json({ success: true, donors });
  } catch (error) {
    console.error('Fetch campaign donors error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST new campaign
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, text, target_amount } = req.body;
    let image = req.body.image;
    
    if (req.file) {
      image = req.file.path;
    }
    
    if (!name || !text || !target_amount) {
      return res.status(400).json({ success: false, message: 'Name, text, and target_amount are required' });
    }

    await sql`
      INSERT INTO campaigns (name, text, image, target_amount)
      VALUES (${name}, ${text}, ${image || null}, ${target_amount})
    `;
    
    res.json({ success: true, message: 'Campaign created successfully' });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT update campaign
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, text, target_amount } = req.body;
    let image = req.body.image;

    if (req.file) {
      image = req.file.path;
    }
    
    if (!name || !text || !target_amount) {
      return res.status(400).json({ success: false, message: 'Name, text, and target_amount are required' });
    }

    if (image) {
      await sql`
        UPDATE campaigns 
        SET name = ${name}, text = ${text}, image = ${image}, target_amount = ${target_amount}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE campaigns 
        SET name = ${name}, text = ${text}, target_amount = ${target_amount}
        WHERE id = ${id}
      `;
    }
    
    res.json({ success: true, message: 'Campaign updated successfully' });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM campaigns WHERE id = ${id}`;
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
