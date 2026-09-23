const express = require('express');
const router = express.Router();
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');

const sql = neon(process.env.DATABASE_URL);

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    
    if (user.role === 'volunteer' && user.status !== 'approved') {
      return res.status(401).json({ success: false, message: 'Your application is still pending approval' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // In a real application, you would generate and return a JWT here
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.working_area,
        status: user.status,
        appliedDate: user.created_at,
        area_of_interest: user.area_of_interest,
        photo: user.profile_pic_url
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
