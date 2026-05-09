require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
const path        = require('path');

const authRoutes      = require('./routes/auth');
const shipmentsRoutes = require('./routes/shipments');
const merchantsRoutes = require('./routes/merchants');
const agentsRoutes    = require('./routes/agents');
const settingsRoutes  = require('./routes/settings');
const { returnsRouter, expensesRouter } = require('./routes/returns_expenses');
const { dashRouter, transfersRouter }   = require('./routes/dashboard_transfers');

const app = express();

// ── Security ─────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 300,
  message: { error: 'طلبات كثيرة، حاول لاحقاً' }
}));

// ── Body Parser ───────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ──────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'FastShip Express API' });
});

// ── Routes ────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/merchants', merchantsRoutes);
app.use('/api/agents',    agentsRoutes);
app.use('/api/returns',   returnsRouter);
app.use('/api/expenses',  expensesRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/dashboard', dashRouter);
app.use('/api/settings',  settingsRoutes);

// ── 404 ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود' });
});

// ── Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'خطأ داخلي في الخادم' });
});

// ── Start ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 FastShip API running on port ${PORT}`);
  console.log(`📦 ENV: ${process.env.NODE_ENV || 'development'}`);
});
