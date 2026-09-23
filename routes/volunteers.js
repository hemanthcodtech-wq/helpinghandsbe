const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const nodemailer = require('nodemailer');

const sql = neon(process.env.DATABASE_URL);

// In-memory OTP store (email -> { otp, expiresAt })

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'helpinghands/volunteers',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
  }
});
const upload = multer({ storage: storage });

const otpStore = {};

// Config nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Route: Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    
    // Check if email already registered
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in memory
    otpStore[email] = { otp, expiresAt };

    // Send email
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Helping Hands" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Volunteer Application OTP",
        text: `Hi ${name || 'Volunteer'},

Your OTP for registration is: ${otp}

This OTP is valid for 10 minutes.

Thank you,
Helping Hands Team`
      });
      console.log(`OTP sent to ${email}`);
    } else {
      console.warn('SMTP_USER and SMTP_PASS not configured. Printing OTP to console for development:');
      console.warn(`>>> OTP for ${email}: ${otp} <<<`);
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Apply as volunteer (Now verifies OTP and accepts password)
router.post('/apply', (req, res, next) => {
  upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'aadhaar_front', maxCount: 1 },
    { name: 'aadhaar_back', maxCount: 1 }
  ])(req, res, function (err) {
    if (err) return res.status(500).json({ success: false, message: 'Upload error: ' + err.message });
    next();
  });
}, async (req, res) => {
  try {
    const data = req.body;
    
    // We expect email, phone, name, otp, password as mandatory minimums.
    if (!data.name || !data.email || !data.phone || !data.otp || !data.password) {
      return res.status(400).json({ success: false, message: 'All required fields including OTP and Password must be provided' });
    }

    // Verify OTP
    const stored = otpStore[data.email];
    if (!stored) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
    }
    if (Date.now() > stored.expiresAt) {
      delete otpStore[data.email];
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }
    if (stored.otp !== data.otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    delete otpStore[data.email];

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${data.email}`;
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    const profile_pic_url = req.files && req.files['profile_picture'] ? req.files['profile_picture'][0].path : null;
    const aadhaar_front_url = req.files && req.files['aadhaar_front'] ? req.files['aadhaar_front'][0].path : null;
    const aadhaar_back_url = req.files && req.files['aadhaar_back'] ? req.files['aadhaar_back'][0].path : null;

    await sql`
      INSERT INTO users (
        name, email, phone, city, role, message, status, password,
        gender, parent_name, dob, profession, blood_group, aadhaar,
        state, district, working_area, pincode, address,
        profile_pic_url, aadhaar_front_url, aadhaar_back_url
      ) VALUES (
        ${data.name}, ${data.email}, ${data.phone}, ${data.city || data.working_area || ''}, 'volunteer', ${data.message || ''}, 'pending', ${passwordHash},
        ${data.gender || null}, ${data.parent_name || null}, ${data.dob || null}, ${data.profession || null}, ${data.blood_group || null}, ${data.aadhaar || null},
        ${data.state || null}, ${data.district || null}, ${data.working_area || null}, ${data.pincode || null}, ${data.address || null},
        ${profile_pic_url}, ${aadhaar_front_url}, ${aadhaar_back_url}
      )
    `;

    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET all volunteer updates (putting this here to mark where we are)


// Get ALL volunteers (pending, approved, rejected)
router.get('/all', async (req, res) => {
  try {
    // Also format created_at date as appliedDate for UI
    const volunteers = await sql`
      SELECT *, TO_CHAR(created_at, 'YYYY-MM-DD') as "appliedDate", 0 as hours FROM users 
      WHERE role != 'admin' OR role IS NULL
      ORDER BY id DESC
    `;
    res.json({ success: true, volunteers });
  } catch (error) {
    console.error('Fetch all volunteers error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get pending requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await sql`SELECT *, TO_CHAR(created_at, 'YYYY-MM-DD') as "appliedDate" FROM users WHERE status = 'pending' ORDER BY id DESC`;
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Fetch requests error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Approve request
router.post('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await sql`SELECT name, email FROM users WHERE id = ${id}`;
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    
    const user = users[0];

    await sql`UPDATE users SET status = 'approved' WHERE id = ${id}`;
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Helping Hands" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Volunteer Application Approved",
        text: `Hi ${user.name},\n\nYour volunteer application has been approved! You can now login using the password you set during registration.\n\nThank you,\nHelping Hands Team`
      });
      console.log(`Approval email sent to ${user.email}`);
    } else {
      console.warn('SMTP_USER and SMTP_PASS not configured. Approval email skipped for:', user.email);
    }

    res.json({ success: true, message: 'Volunteer approved' });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reject request
router.post('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await sql`SELECT name, email FROM users WHERE id = ${id}`;
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
    
    const user = users[0];

    await sql`UPDATE users SET status = 'rejected' WHERE id = ${id}`;
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: `"Helping Hands" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Volunteer Application Update",
        text: `Hi ${user.name},\n\nThank you for your interest in volunteering with us. Unfortunately, we are unable to accept your application at this time.\n\nThank you,\nHelping Hands Team`
      });
      console.log(`Rejection email sent to ${user.email}`);
    } else {
      console.warn('SMTP_USER and SMTP_PASS not configured. Rejection email skipped for:', user.email);
    }

    res.json({ success: true, message: 'Volunteer rejected' });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET all volunteer updates
router.get('/updates', async (req, res) => {
  try {
    const updates = await sql`
      SELECT id, volunteer_id as "volunteerId", title, message, type, TO_CHAR(created_at, 'YYYY-MM-DD') as date 
      FROM volunteer_updates 
      ORDER BY id DESC
    `;
    res.json({ success: true, updates });
  } catch (error) {
    console.error('Fetch updates error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST new volunteer update
router.post('/updates', async (req, res) => {
  try {
    const { volunteerId, title, message, type } = req.body;
    if (!volunteerId || !title || !message || !type) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    await sql`
      INSERT INTO volunteer_updates (volunteer_id, title, message, type)
      VALUES (${volunteerId}, ${title}, ${message}, ${type})
    `;
    res.json({ success: true, message: 'Update posted successfully' });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DELETE a volunteer update
router.delete('/updates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM volunteer_updates WHERE id = ${id}`;
    res.json({ success: true, message: 'Update deleted successfully' });
  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET volunteer activities
router.get('/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const activities = await sql`SELECT id, volunteer_id, title, hours, status, TO_CHAR(date, 'YYYY-MM-DD') as formatted_date FROM volunteer_activities WHERE volunteer_id = ${id} ORDER BY date DESC`;
    res.json({ success: true, activities });
  } catch (error) {
    console.error('Fetch activities error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET volunteer campaigns
router.get('/:id/campaigns', async (req, res) => {
  try {
    const { id } = req.params;
    const campaigns = await sql`SELECT id, volunteer_id, campaign_name, role, status, TO_CHAR(date, 'YYYY-MM-DD') as formatted_date FROM volunteer_campaigns WHERE volunteer_id = ${id} ORDER BY date DESC`;
    res.json({ success: true, campaigns });
  } catch (error) {
    console.error('Fetch campaigns error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET volunteer programs
router.get('/:id/programs', async (req, res) => {
  try {
    const { id } = req.params;
    const programs = await sql`SELECT * FROM volunteer_programs WHERE volunteer_id = ${id}`;
    res.json({ success: true, programs });
  } catch (error) {
    console.error('Fetch programs error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET volunteer certificates
router.get('/:id/certificates', async (req, res) => {
  try {
    const { id } = req.params;
    const certificates = await sql`SELECT id, volunteer_id, name, issuer, TO_CHAR(date, 'YYYY-MM-DD') as formatted_date FROM volunteer_certificates WHERE volunteer_id = ${id} ORDER BY date DESC`;
    res.json({ success: true, certificates });
  } catch (error) {
    console.error('Fetch certificates error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
