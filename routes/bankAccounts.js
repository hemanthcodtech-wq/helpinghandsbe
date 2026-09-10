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
    folder: 'helpinghands/bank_accounts',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage: storage });

// GET all bank accounts
router.get('/', async (req, res) => {
  try {
    const bankAccounts = await sql`
      SELECT * FROM bank_accounts ORDER BY created_at DESC
    `;
    res.json({ success: true, bankAccounts });
  } catch (error) {
    console.error('Fetch all bank accounts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST a new bank account
router.post('/', upload.single('qr_code_image'), async (req, res) => {
  try {
    const { bank_name, account_name, account_number, ifsc_code, branch, is_active } = req.body;
    let qrCodeUrl = null;

    if (req.file) {
      qrCodeUrl = req.file.path;
    }

    const newBankAccount = await sql`
      INSERT INTO bank_accounts (bank_name, account_name, account_number, ifsc_code, branch, qr_code_url, is_active)
      VALUES (${bank_name}, ${account_name}, ${account_number}, ${ifsc_code}, ${branch || null}, ${qrCodeUrl}, ${is_active !== undefined ? is_active === 'true' || is_active === true : true})
      RETURNING *
    `;

    res.status(201).json({ success: true, bankAccount: newBankAccount[0] });
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({ success: false, message: 'Failed to create bank account' });
  }
});

// PUT update a bank account
router.put('/:id', upload.single('qr_code_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_name, account_name, account_number, ifsc_code, branch, is_active } = req.body;

    let updateQuery;

    if (req.file) {
      const qrCodeUrl = req.file.path;
      updateQuery = sql`
        UPDATE bank_accounts
        SET bank_name = ${bank_name}, account_name = ${account_name}, account_number = ${account_number},
            ifsc_code = ${ifsc_code}, branch = ${branch || null}, is_active = ${is_active === 'true' || is_active === true},
            qr_code_url = ${qrCodeUrl}
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      updateQuery = sql`
        UPDATE bank_accounts
        SET bank_name = ${bank_name}, account_name = ${account_name}, account_number = ${account_number},
            ifsc_code = ${ifsc_code}, branch = ${branch || null}, is_active = ${is_active === 'true' || is_active === true}
        WHERE id = ${id}
        RETURNING *
      `;
    }

    const updatedBankAccount = await updateQuery;

    if (updatedBankAccount.length === 0) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    res.json({ success: true, bankAccount: updatedBankAccount[0] });
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({ success: false, message: 'Failed to update bank account' });
  }
});

// DELETE a bank account
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await sql`
      DELETE FROM bank_accounts WHERE id = ${id} RETURNING *
    `;
    
    if (deleted.length === 0) {
      return res.status(404).json({ success: false, message: 'Bank account not found' });
    }

    res.json({ success: true, message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete bank account' });
  }
});

module.exports = router;
