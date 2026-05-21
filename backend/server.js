require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');

const app = express();

// ── CORS — explicitly allow the Vite dev frontend ─────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/score',         require('./routes/score'));
app.use('/api/nudges',        require('./routes/nudges'));
app.use('/api/email-logs',    require('./routes/emailLogs'));
app.use('/api/investments',   require('./routes/investments'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'IntentEdge Backend Running' });
});

app.get('/', (req, res) => {
  res.send('IntentEdge Backend API is running...');
});

// ── Start server + connect DB + seed ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n✅ IntentEdge Backend Running on port ${PORT}`);

  await connectDB();

  // ── Seed demo accounts (Removed) ────────────────────────────────────────
  console.log('✅ Auth API ready — POST /api/auth/login');
});
