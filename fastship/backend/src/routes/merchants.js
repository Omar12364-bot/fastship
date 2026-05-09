const router = require('express').Router();
const db   = require('../db/pool');
const auth = require('../middleware/auth');

const cols = `m.*, b.name AS branch_name, c.name AS city_name`;
const joins = `LEFT JOIN branches b ON b.id = m.branch_id LEFT JOIN cities c ON c.id = b.city_id`;

router.get('/', auth, async (req, res) => {
  try {
    const { q, active } = req.query;
    const conds = [], vals = [];
    let i = 1;
    if (q)      { conds.push(`(m.name ILIKE $${i} OR m.code ILIKE $${i} OR m.phone ILIKE $${i})`); vals.push(`%${q}%`); i++; }
    if (active !== undefined) { conds.push(`m.active = $${i++}`); vals.push(active === 'true'); }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const { rows } = await db.query(`SELECT ${cols} FROM merchants m ${joins} ${where} ORDER BY m.created_at DESC`, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT ${cols} FROM merchants m ${joins} WHERE m.id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'التاجر غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

router.post('/', auth, async (req, res) => {
  const { name, phone, email, address, branch_id, pricing_list, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم التاجر مطلوب' });
  try {
    const code = 'MER-' + Date.now().toString().slice(-5);
    const { rows } = await db.query(
      `INSERT INTO merchants (name,code,phone,email,address,branch_id,pricing_list,notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, code, phone||null, email||null, address||null, branch_id||null, pricing_list||null, notes||null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

router.put('/:id', auth, async (req, res) => {
  const { name, phone, email, address, branch_id, pricing_list, notes, active } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE merchants SET name=$1,phone=$2,email=$3,address=$4,branch_id=$5,
       pricing_list=$6,notes=$7,active=$8 WHERE id=$9 RETURNING *`,
      [name, phone||null, email||null, address||null, branch_id||null,
       pricing_list||null, notes||null, active !== false, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'التاجر غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('UPDATE merchants SET active=false WHERE id=$1', [req.params.id]);
    res.json({ message: 'تم الحذف' });
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

module.exports = router;
