const router = require('express').Router();
const db   = require('../db/pool');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { q, active, city_id } = req.query;
    const conds = [], vals = []; let i = 1;
    if (q)       { conds.push(`(a.name ILIKE $${i} OR a.phone ILIKE $${i})`); vals.push(`%${q}%`); i++; }
    if (city_id) { conds.push(`a.city_id = $${i++}`); vals.push(city_id); }
    if (active !== undefined) { conds.push(`a.active = $${i++}`); vals.push(active === 'true'); }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const { rows } = await db.query(
      `SELECT a.*, c.name AS city_name, b.name AS branch_name
       FROM agents a
       LEFT JOIN cities c ON c.id = a.city_id
       LEFT JOIN branches b ON b.id = a.branch_id
       ${where} ORDER BY a.created_at DESC`, vals
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT a.*, c.name AS city_name FROM agents a LEFT JOIN cities c ON c.id=a.city_id WHERE a.id=$1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'المندوب غير موجود' });

    const { rows: stats } = await db.query(
      `SELECT status, COUNT(*) FROM shipments WHERE agent_id=$1 GROUP BY status`, [req.params.id]
    );
    res.json({ ...rows[0], stats });
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

router.post('/', auth, async (req, res) => {
  const { name, phone, city_id, zone, branch_id, national_id, notes } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'الاسم والهاتف مطلوبان' });
  try {
    const { rows } = await db.query(
      `INSERT INTO agents (name,phone,city_id,zone,branch_id,national_id,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, phone, city_id||null, zone||null, branch_id||null, national_id||null, notes||null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

router.put('/:id', auth, async (req, res) => {
  const { name, phone, city_id, zone, branch_id, national_id, notes, active } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE agents SET name=$1,phone=$2,city_id=$3,zone=$4,branch_id=$5,
       national_id=$6,notes=$7,active=$8 WHERE id=$9 RETURNING *`,
      [name, phone, city_id||null, zone||null, branch_id||null,
       national_id||null, notes||null, active !== false, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'المندوب غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('UPDATE agents SET active=false WHERE id=$1', [req.params.id]);
    res.json({ message: 'تم الحذف' });
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

module.exports = router;
