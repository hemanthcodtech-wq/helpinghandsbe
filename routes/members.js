const express = require("express")
const router = express.Router()
const { Pool } = require("@neondatabase/serverless")
const bcrypt = require("bcrypt")
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const multer = require("multer")
require("dotenv").config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'helpinghands/members',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
})
const upload = multer({ storage: storage })

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, membership_tier, aadhaar, address, state, district, pincode, blood_group, profile_picture_url, is_active, created_at FROM members ORDER BY created_at DESC")
    res.json({ success: true, members: result.rows })
  } catch (error) {
    console.error("Error fetching members:", error)
    res.status(500).json({ success: false, error: "Failed to fetch members" })
  }
})

router.post("/register", upload.single("profile_picture"), async (req, res) => {
  const { name, email, phone, password, membership_tier, aadhaar, address, state, district, pincode, blood_group, profile_picture_url: provided_url } = req.body
  try {
    const existing = await pool.query("SELECT id FROM members WHERE email = $1", [email])
    if (existing.rows.length > 0) return res.status(400).json({ success: false, error: "Email already registered" })

    const hash = await bcrypt.hash(password, 10)
    const profile_picture_url = req.file ? req.file.path : (provided_url || null)

    const result = await pool.query(
      `INSERT INTO members 
       (name, email, phone, password_hash, membership_tier, aadhaar, address, state, district, pincode, blood_group, profile_picture_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id, name, email, membership_tier`,
      [name, email, phone, hash, membership_tier, aadhaar, address, state, district, pincode, blood_group, profile_picture_url]
    )
    res.json({ success: true, member: result.rows[0] })
  } catch (err) {
    console.error("Registration error:", err)
    res.status(500).json({ success: false, error: "Registration failed" })
  }
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body
  try {
    const result = await pool.query("SELECT * FROM members WHERE email = $1", [email])
    if (result.rows.length === 0) return res.status(401).json({ success: false, error: "Invalid credentials" })
    
    const member = result.rows[0]
    if (!member.is_active) return res.status(403).json({ success: false, error: "Account disabled" })

    const valid = await bcrypt.compare(password, member.password_hash)
    if (!valid) return res.status(401).json({ success: false, error: "Invalid credentials" })

    const { password_hash, ...safeMember } = member
    res.json({ success: true, member: safeMember })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ success: false, error: "Login failed" })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM members WHERE id = $1", [req.params.id])
    res.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    res.status(500).json({ success: false, error: "Delete failed" })
  }
})

router.put("/:id", upload.single("profile_picture"), async (req, res) => {
  const { id } = req.params
  const { name, phone, address, state, district, pincode, blood_group, aadhaar } = req.body
  
  try {
    // If a new file is uploaded, we update profile_picture_url
    if (req.file) {
      const profile_picture_url = req.file.path
      const result = await pool.query(
        `UPDATE members SET 
          name = $1, phone = $2, address = $3, state = $4, district = $5, 
          pincode = $6, blood_group = $7, aadhaar = $8, profile_picture_url = $9
         WHERE id = $10 RETURNING *`,
        [name, phone, address, state, district, pincode, blood_group, aadhaar, profile_picture_url, id]
      )
      const { password_hash, ...safeMember } = result.rows[0]
      res.json({ success: true, member: safeMember })
    } else {
      const result = await pool.query(
        `UPDATE members SET 
          name = $1, phone = $2, address = $3, state = $4, district = $5, 
          pincode = $6, blood_group = $7, aadhaar = $8
         WHERE id = $9 RETURNING *`,
        [name, phone, address, state, district, pincode, blood_group, aadhaar, id]
      )
      const { password_hash, ...safeMember } = result.rows[0]
      res.json({ success: true, member: safeMember })
    }
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ success: false, error: "Failed to update profile" })
  }
})

router.put("/:id/status", async (req, res) => {
  try {
    const result = await pool.query("UPDATE members SET is_active = $1 WHERE id = $2 RETURNING id, is_active", [req.body.is_active, req.params.id])
    res.json({ success: true, member: result.rows[0] })
  } catch (error) {
    console.error("Status update error:", error)
    res.status(500).json({ success: false, error: "Update failed" })
  }
})

module.exports = router
