require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Neon DB connection
// Neon recommends using neon() for serverless environments (HTTP queries)
const sql = neon(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'HelpingBe Backend is running!' });
});

// Example route to check DB connection
app.get('/api/db-check', async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    res.json({ 
      success: true, 
      message: 'Database connection successful', 
      version: result[0].version 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);
const volunteerRoutes = require('./routes/volunteers');
app.use('/api/volunteers', volunteerRoutes);
const donationsRoutes = require('./routes/donations');
app.use('/api/donations', donationsRoutes);
const resourcesRoutes = require('./routes/resources');
app.use('/api/resources', resourcesRoutes);
const programsRoutes = require('./routes/programs');
app.use('/api/programs', programsRoutes);
const campaignsRoutes = require('./routes/campaigns');
const teamsRoutes = require('./routes/teams');
const eventsRoutes = require('./routes/events');
const partnersRoutes = require('./routes/partners');
const testimonialsRoutes = require('./routes/testimonials');
const settingsRoutes = require('./routes/settings');
const bankAccountRoutes = require('./routes/bankAccounts');
const membersRouter = require('./routes/members');

app.use('/api/campaigns', campaignsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/members', membersRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Restart nodemon
