const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const crypto = require('crypto');

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
    folder: 'helpinghands/donations',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
  }
});
const upload = multer({ storage: storage });

// Route to handle donation form submission
router.post('/donate', upload.fields([
  { name: 'profile_picture', maxCount: 1 },
  { name: 'aadhaar_front', maxCount: 1 },
  { name: 'aadhaar_back', maxCount: 1 }
]), async (req, res) => {
  try {
    const data = req.body;
    
    // Extract file URLs if they were uploaded
    const profile_pic_url = req.files && req.files['profile_picture'] ? req.files['profile_picture'][0].path : null;
    const aadhaar_front_url = req.files && req.files['aadhaar_front'] ? req.files['aadhaar_front'][0].path : null;
    const aadhaar_back_url = req.files && req.files['aadhaar_back'] ? req.files['aadhaar_back'][0].path : null;

    // Generate a random transaction ID for this demo
    const txn_id = 'TXN' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const amountStr = data.amount ? data.amount.replace(/[^0-9]/g, '') : "0";

    // Allow parsing campaign_id if present
    const campaign_id = data.campaign_id ? parseInt(data.campaign_id) : null;

    // Insert into database
    await sql`
      INSERT INTO donations (
        amount, payment_method, recurring, designation, name, gender,
        parent_name, dob, profession, blood_group, email, phone,
        aadhaar, state, district, working_area, pincode, address,
        profile_pic_url, aadhaar_front_url, aadhaar_back_url, txn_id, campaign_id, status
      ) VALUES (
        ${amountStr}, ${data.payment_method}, ${data.recurring === 'true'}, ${data.designation}, ${data.name}, ${data.gender},
        ${data.parent_name}, ${data.dob || null}, ${data.profession}, ${data.blood_group}, ${data.email}, ${data.phone},
        ${data.aadhaar}, ${data.state}, ${data.district}, ${data.working_area}, ${data.pincode}, ${data.address},
        ${profile_pic_url}, ${aadhaar_front_url}, ${aadhaar_back_url}, ${txn_id}, ${campaign_id}, 'success'
      )
    `;

    res.json({ success: true, message: 'Donation registered successfully', txn_id, profile_pic_url });
  } catch (error) {
    console.error('Donate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Route for admin to get all donations
router.get('/all', async (req, res) => {
  try {
    // Optionally join campaigns to show campaign name in standard donations list
    const donations = await sql`
      SELECT d.*, c.name as campaign_name 
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      ORDER BY d.id DESC
    `;
    res.json({ success: true, donations });
  } catch (error) {
    console.error('Fetch donations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
