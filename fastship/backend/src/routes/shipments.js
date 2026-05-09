const router = require('express').Router();
const db     = require('../db/pool');
const auth   = require('../middleware/auth');

// GET /api/shipments  — list with filters + pagination
router.get('/', auth, async (req, res) => {
  try {
    const { status, merchant_id, agent_id, city_id, date_from, date_to,
            q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conds = [], vals = [];
    let i = 1;

    if (status)      { conds.push(`s.status = $${i++}`);        vals.push(status); }
    if (merchant_id) { conds.push(`s.merchant_id = $${i++}`);   vals.push(merchant_id); }
    if (agent_id)    { conds.push(`s.agent_id = $${i++}`);      vals.push(agent_id); }
    if (city_id)     { conds.push(`s.city_id = $${i++}`);       vals.push(city_id); }
    if (date_from)   { conds.push(`s.date >= $${i++}`);         vals.push(date_from); }
    if (date_to)     { conds.push(`s.date <= $${i++}`);         vals.push(date_to); }
    if (q)           { conds.push(`(s.bill_no ILIKE $${i} OR s.recipient ILIKE $${i} OR s.phone ILIKE $${i})`); vals.push(`%${q}%`); i++; }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    const [{ rows }, { rows: cnt }] = await Promise.all([
      db.query(
        `SELECT s.*, m.name AS merchant_name, a.name AS agent_name, c.name AS city_name
         FROM shipments s
         LEFT JOIN merchants m ON m.id = s.merchant_id
         LEFT JOIN agents a ON a.id = s.agent_id
         LEFT JOIN cities c ON c.id = s.city_id
         ${where} ORDER BY s.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
        [...vals, limit, offset]
      ),
      db.query(`SELECT COUNT(*) FROM shipments s ${where}`, vals)
    ]);

    res.json({ data: rows, total: parseInt(cnt[0].count), page: +page, limit: +limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/shipments/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT s.*, m.name AS merchant_name, a.name AS agent_name,
              c.name AS city_name, u.name AS created_by_name
       FROM shipments s
       LEFT JOIN merchants m ON m.id = s.merchant_id
       LEFT JOIN agents    a ON a.id = s.agent_id
       LEFT JOIN cities    c ON c.id = s.city_id
       LEFT JOIN users     u ON u.id = s.created_by
       WHERE s.id = $1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الشحنة غير موجودة' });

    const { rows: logs } = await db.query(
      `SELECT l.*, u.name AS by_name FROM shipment_logs l
       LEFT JOIN users u ON u.id = l.created_by
       WHERE l.shipment_id = $1 ORDER BY l.created_at`, [req.params.id]
    );
    res.json({ ...rows[0], logs });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/shipments
router.post('/', auth, async (req, res) => {
  const { merchant_id, recipient, phone, city_id, zone, address,
          amount, cod, description, weight, branch_id, notes } = req.body;

  if (!recipient || !phone || !city_id)
    return res.status(400).json({ error: 'بيانات ناقصة: المستلم، الهاتف، المدينة' });

  try {
    const bill_no = 'FS-' + Date.now().toString().slice(-6);
    const { rows } = await db.query(
      `INSERT INTO shipments (bill_no, merchant_id, recipient, phone, city_id, zone,
        address, amount, cod, description, weight, branch_id, notes, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [bill_no, merchant_id||null, recipient, phone, city_id, zone||null,
       address||null, amount||0, cod||0, description||null, weight||null,
       branch_id||null, notes||null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// PUT /api/shipments/:id
router.put('/:id', auth, async (req, res) => {
  const { recipient, phone, city_id, zone, address, amount, cod,
          description, weight, merchant_id, agent_id, branch_id, notes } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE shipments SET
        recipient=$1, phone=$2, city_id=$3, zone=$4, address=$5,
        amount=$6, cod=$7, description=$8, weight=$9,
        merchant_id=$10, agent_id=$11, branch_id=$12, notes=$13
       WHERE id=$14 RETURNING *`,
      [recipient, phone, city_id, zone||null, address||null, amount||0, cod||0,
       description||null, weight||null, merchant_id||null, agent_id||null,
       branch_id||null, notes||null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الشحنة غير موجودة' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// PATCH /api/shipments/:id/status — change status + log
router.patch('/:id/status', auth, async (req, res) => {
  const { status, reason_id, note } = req.body;
  const validStatuses = ['جديدة','قيد التوصيل','تم التوصيل','مرتجع','ملغي','مؤجل'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ error: 'حالة غير صالحة' });

  try {
    const { rows: cur } = await db.query('SELECT status FROM shipments WHERE id=$1', [req.params.id]);
    if (!cur[0]) return res.status(404).json({ error: 'الشحنة غير موجودة' });

    const { rows } = await db.query(
      `UPDATE shipments SET status=$1, reason_id=$2 WHERE id=$3 RETURNING *`,
      [status, reason_id||null, req.params.id]
    );
    await db.query(
      `INSERT INTO shipment_logs (shipment_id, old_status, new_status, note, created_by)
       VALUES ($1,$2,$3,$4,$5)`,
      [req.params.id, cur[0].status, status, note||null, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// PATCH /api/shipments/:id/assign — assign agent
router.patch('/:id/assign', auth, async (req, res) => {
  const { agent_id } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE shipments SET agent_id=$1, status='قيد التوصيل' WHERE id=$2 RETURNING *`,
      [agent_id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الشحنة غير موجودة' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// DELETE /api/shipments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM shipments WHERE id=$1', [req.params.id]);
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

module.exports = router;
