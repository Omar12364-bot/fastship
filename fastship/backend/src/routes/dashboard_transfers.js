const express = require('express');
const db   = require('../db/pool');
const auth = require('../middleware/auth');

// ── DASHBOARD ────────────────────────────────────
const dashRouter = express.Router();

dashRouter.get('/', auth, async (req, res) => {
  try {
    const [kpi, byStatus, delayed, recentShipments] = await Promise.all([
      db.query(`
        SELECT
          COUNT(*) FILTER (WHERE status='جديدة')            AS new_count,
          COUNT(*) FILTER (WHERE status='قيد التوصيل')      AS in_delivery,
          COUNT(*) FILTER (WHERE status='تم التوصيل')       AS delivered,
          COUNT(*) FILTER (WHERE status='مرتجع')            AS returned,
          COUNT(*) FILTER (WHERE status='ملغي')             AS cancelled,
          COUNT(*) FILTER (WHERE status='مؤجل')             AS postponed,
          COALESCE(SUM(amount) FILTER (WHERE status='تم التوصيل'),0) AS total_revenue,
          COUNT(*)                                           AS total
        FROM shipments WHERE date >= NOW() - INTERVAL '30 days'
      `),
      db.query(`SELECT status, COUNT(*) FROM shipments GROUP BY status`),
      db.query(`
        SELECT s.*, m.name AS merchant_name, c.name AS city_name
        FROM shipments s
        LEFT JOIN merchants m ON m.id=s.merchant_id
        LEFT JOIN cities c ON c.id=s.city_id
        WHERE s.status='مؤجل' ORDER BY s.updated_at DESC LIMIT 10
      `),
      db.query(`
        SELECT s.bill_no, s.recipient, s.status, s.amount, s.created_at, m.name AS merchant_name
        FROM shipments s LEFT JOIN merchants m ON m.id=s.merchant_id
        ORDER BY s.created_at DESC LIMIT 8
      `)
    ]);

    res.json({
      kpi: kpi.rows[0],
      by_status: byStatus.rows,
      delayed: delayed.rows,
      recent: recentShipments.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// ── TRANSFERS ────────────────────────────────────
const transfersRouter = express.Router();

transfersRouter.get('/', auth, async (req, res) => {
  try {
    const { party_type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conds = [], vals = []; let i = 1;
    if (party_type) { conds.push(`t.party_type=$${i++}`); vals.push(party_type); }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const { rows } = await db.query(
      `SELECT t.*, u.name AS created_by_name
       FROM transfers t LEFT JOIN users u ON u.id=t.created_by
       ${where} ORDER BY t.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...vals, limit, offset]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

transfersRouter.post('/', auth, async (req, res) => {
  const { party_type, party_id, op_type, payment_method, amount, notes } = req.body;
  if (!amount || !op_type) return res.status(400).json({ error: 'المبلغ ونوع العملية مطلوبان' });
  try {
    const { rows } = await db.query(
      `INSERT INTO transfers (party_type,party_id,op_type,payment_method,amount,notes,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [party_type||null, party_id||null, op_type, payment_method||null, amount, notes||null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

module.exports = { dashRouter, transfersRouter };
