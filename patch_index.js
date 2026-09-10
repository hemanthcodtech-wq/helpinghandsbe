const fs = require('fs');
const file = 'index.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('eventsRoutes')) {
  content = content.replace("const teamsRoutes = require('./routes/teams');", "const teamsRoutes = require('./routes/teams');\nconst eventsRoutes = require('./routes/events');");
  content = content.replace("app.use('/api/teams', teamsRoutes);", "app.use('/api/teams', teamsRoutes);\napp.use('/api/events', eventsRoutes);");
  fs.writeFileSync(file, content);
  console.log('index.js patched successfully');
} else {
  console.log('Already patched');
}
