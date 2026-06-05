const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors({ 
  origin: '*', 
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'], 
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: false
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/workers',     require('./routes/workers'));
app.use('/api/supervisors', require('./routes/supervisors'));
app.use('/api/devices',     require('./routes/devices'));
app.use('/api/sensors',     require('./routes/sensors'));
app.use('/api/alerts',      require('./routes/alerts'));
app.use('/api/reports',     require('./routes/reports'));
app.use('/api/dashboard',   require('./routes/dashboard'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', message: 'SewerGuard API Running', timestamp: new Date() }));

// ── Serve React Frontend from backend ──────────────────────────
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// All non-API routes → React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n✅ SewerGuard API running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api\n`);
});

module.exports = app;
