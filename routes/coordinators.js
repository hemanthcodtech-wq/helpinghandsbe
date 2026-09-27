const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
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

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'helpinghands/coordinators',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
  }
});
const upload = multer({ storage: storage });

// Route: Create Coordinator with Document Uploads
router.post(
  '/', 
  (req, res, next) => {
    upload.fields([
      { name: 'profile_picture', maxCount: 1 },
      { name: 'aadhaar_front', maxCount: 1 },
      { name: 'aadhaar_back', maxCount: 1 }
    ])(req, res, function (err) {
      if (err) return res.status(500).json({ success: false, message: 'Upload error: ' + err.message });
      next();
    });
  }, 
  async (req, res) => {
    try {
      const data = req.body;
      
      // Basic validation
      if (!data.email || !data.password || !data.name) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Check if email already exists
      const existing = await sql`SELECT id FROM users WHERE email = ${data.email}`;
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Get uploaded file URLs
      const profilePicUrl = req.files?.['profile_picture'] ? req.files['profile_picture'][0].path : null;
      const aadhaarFrontUrl = req.files?.['aadhaar_front'] ? req.files['aadhaar_front'][0].path : null;
      const aadhaarBackUrl = req.files?.['aadhaar_back'] ? req.files['aadhaar_back'][0].path : null;

      // Insert into users table (assuming we store coordinators here with a specific role)
      // If you have a separate `coordinators` table, you can replace `users` with `coordinators` and add the extra fields
      
      // Let's create the user record first
      const userResult = await sql`
        INSERT INTO users (
          name, email, phone, role, password, status,
          gender, parent_name, dob, profession, blood_group, aadhaar,
          state, district, working_area, pincode, address,
          profile_pic_url, aadhaar_front_url, aadhaar_back_url
        ) VALUES (
          ${data.name}, ${data.email}, ${data.phone}, 'coordinator', ${hashedPassword}, 'active',
          ${data.gender || null}, ${data.parentName || null}, ${data.dob || null}, ${data.profession || null}, ${data.bloodGroup || null}, ${data.aadhaar || null},
          ${data.state || null}, ${data.district || null}, ${data.workingArea || null}, ${data.pincode || null}, ${data.address || null},
          ${profilePicUrl}, ${aadhaarFrontUrl}, ${aadhaarBackUrl}
        ) RETURNING id
      `;
      
      const userId = userResult[0].id;
      
      res.json({ success: true, message: 'Coordinator created successfully', user_id: userId });
    } catch (error) {
      console.error('Coordinator creation error:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  }
);

// Route: Coordinator Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find coordinator by email
    const users = await sql`SELECT id, name, email, phone, role, password, status, profile_pic_url, blood_group FROM users WHERE email = ${email} AND role = 'coordinator'`;
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user not found' });
    }

    const user = users[0];

    // Check if active
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Clean user object before sending
    delete user.password;

    res.json({ success: true, message: 'Login successful', coordinator: user });
  } catch (error) {
    console.error('Coordinator login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all coordinators (dummy for now until schema is confirmed)
router.get("/", async (req, res) => {
  try {
    // Assuming role = 'coordinator' in users table
    const coords = await sql`SELECT id, name, email, phone, role, status FROM users WHERE role = 'coordinator'`;
    res.json({ success: true, coordinators: coords });
  } catch(error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// Get single coordinator profile
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const users = await sql`SELECT id, name, email, phone, role, status, profile_pic_url, blood_group FROM users WHERE id = ${id} AND role = 'coordinator'`;
    if (users.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, coordinator: users[0] });
  } catch(error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// Get all collections across all coordinators (for Admin)
router.get("/collections", async (req, res) => {
  try {
    const collections = await sql`
      SELECT c.*, u.name as coordinator_name 
      FROM coordinator_collections c
      JOIN users u ON c.coordinator_id = u.id
      ORDER BY c.created_at DESC
    `;
    res.json({ success: true, collections });
  } catch (error) {
    console.error('Fetch collections error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a collection for a specific coordinator
router.post("/:id/collections", async (req, res) => {
  try {
    const coordId = req.params.id;
    const { name, mobile, email, amount, collection_date } = req.body;
    
    if (!name || !mobile || !amount || !collection_date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await sql`
      INSERT INTO coordinator_collections (coordinator_id, name, mobile, email, amount, collection_date)
      VALUES (${coordId}, ${name}, ${mobile}, ${email || null}, ${amount}, ${collection_date})
      RETURNING *
    `;

    res.json({ success: true, collection: result[0] });
  } catch (error) {
    console.error('Add collection error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Get collections for a specific coordinator
router.get("/:id/collections", async (req, res) => {
  try {
    const coordId = req.params.id;
    const collections = await sql`
      SELECT * FROM coordinator_collections 
      WHERE coordinator_id = ${coordId} 
      ORDER BY created_at DESC
    `;
    res.json({ success: true, collections });
  } catch (error) {
    console.error('Fetch collections error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a donor for a specific coordinator
router.post("/:id/donors", async (req, res) => {
  try {
    const coordId = req.params.id;
    const { name, aadhar_number, amount_needed } = req.body;
    
    if (!name || !aadhar_number || !amount_needed) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await sql`
      INSERT INTO coordinator_donors (coordinator_id, name, aadhar_number, amount_needed)
      VALUES (${coordId}, ${name}, ${aadhar_number}, ${amount_needed})
      RETURNING *
    `;

    res.json({ success: true, donor: result[0] });
  } catch (error) {
    console.error('Add donor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// Get donors for a specific coordinator
router.get("/:id/donors", async (req, res) => {
  try {
    const coordId = req.params.id;
    const donors = await sql`
      SELECT * FROM coordinator_donors 
      WHERE coordinator_id = ${coordId} 
      ORDER BY created_at DESC
    `;
    res.json({ success: true, donors });
  } catch (error) {
    console.error('Fetch donors error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all donors for Admin
router.get("/donors", async (req, res) => {
  try {
    const donors = await sql`
      SELECT d.*, u.name as coordinator_name
      FROM coordinator_donors d
      JOIN users u ON d.coordinator_id = u.id
      ORDER BY d.created_at DESC
    `;
    res.json({ success: true, donors });
  } catch (error) {
    console.error('Fetch donors error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
