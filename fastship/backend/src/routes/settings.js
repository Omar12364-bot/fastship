const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const db      = require('../db/pool');
const auth    = require('../middleware/auth');

// ── CITIES ──────────────────────────────────────
router.get('/cities', auth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT c.*, COUNT(z.id) AS zone_count
     FROM cities c LEFT JOIN zones z ON z.city_id=c.id
     GROUP BY c.id ORDER BY c.name`
  );
  res.json(rows);
});
router.post('/cities', auth, async (req, res) => {
  const { name, code, active } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'الاسم والكود مطلوبان' });
  try {
    const { rows } = await db.query(
      'INSERT INTO cities (name,code,active) VALUES ($1,$2,$3) RETURNING *',
      [name, code.toUpperCase(), active !== false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'الكود موجود بالفعل' });
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});
router.put('/cities/:id', auth, async (req, res) => {
  const { name, active } = req.body;
  const { rows } = await db.query(
    'UPDATE cities SET name=$1,active=$2 WHERE id=$3 RETURNING *', [name, active !== false, req.params.id]
  );
  res.json(rows[0] || {});
});

// ── ZONES ───────────────────────────────────────
router.get('/zones', auth, async (req, res) => {
  const { city_id } = req.query;
  const cond = city_id ? 'WHERE z.city_id=$1' : '';
  const vals = city_id ? [city_id] : [];
  const { rows } = await db.query(
    `SELECT z.*, c.name AS city_name FROM zones z LEFT JOIN cities c ON c.id=z.city_id ${cond} ORDER BY c.name,z.name`, vals
  );
  res.json(rows);
});
router.post('/zones', auth, async (req, res) => {
  const { name, city_id, active } = req.body;
  if (!name || !city_id) return res.status(400).json({ error: 'الاسم والمدينة مطلوبان' });
  const { rows } = await db.query(
    'INSERT INTO zones (name,city_id,active) VALUES ($1,$2,$3) RETURNING *',
    [name, city_id, active !== false]
  );
  res.status(201).json(rows[0]);
});
router.put('/zones/:id', auth, async (req, res) => {
  const { name, city_id, active } = req.body;
  const { rows } = await db.query(
    'UPDATE zones SET name=$1,city_id=$2,active=$3 WHERE id=$4 RETURNING *',
    [name, city_id, active !== false, req.params.id]
  );
  res.json(rows[0] || {});
});

// ── BRANCHES ────────────────────────────────────
router.get('/branches', auth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT b.*, c.name AS city_name FROM branches b LEFT JOIN cities c ON c.id=b.city_id ORDER BY b.name`
  );
  res.json(rows);
});
router.post('/branches', auth, async (req, res) => {
  const { name, city_id, manager, phone, address, active } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم الفرع مطلوب' });
  const { rows } = await db.query(
    'INSERT INTO branches (name,city_id,manager,phone,address,active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [name, city_id||null, manager||null, phone||null, address||null, active !== false]
  );
  res.status(201).json(rows[0]);
});
router.put('/branches/:id', auth, async (req, res) => {
  const { name, city_id, manager, phone, address, active } = req.body;
  const { rows } = await db.query(
    'UPDATE branches SET name=$1,city_id=$2,manager=$3,phone=$4,address=$5,active=$6 WHERE id=$7 RETURNING *',
    [name, city_id||null, manager||null, phone||null, address||null, active !== false, req.params.id]
  );
  res.json(rows[0] || {});
});

// ── ROLES ───────────────────────────────────────
router.get('/roles', auth, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM roles ORDER BY id');
  res.json(rows);
});
router.post('/roles', auth, async (req, res) => {
  const { name, permissions, active } = req.body;
  if (!name) return res.status(400).json({ error: 'اسم الدور مطلوب' });
  try {
    const { rows } = await db.query(
      'INSERT INTO roles (name,permissions,active) VALUES ($1,$2,$3) RETURNING *',
      [name, JSON.stringify(permissions || []), active !== false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'الدور موجود بالفعل' });
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});
router.put('/roles/:id', auth, async (req, res) => {
  const { name, permissions, active } = req.body;
  const { rows } = await db.query(
    'UPDATE roles SET name=$1,permissions=$2,active=$3 WHERE id=$4 RETURNING *',
    [name, JSON.stringify(permissions || []), active !== false, req.params.id]
  );
  res.json(rows[0] || {});
});

// ── USERS ───────────────────────────────────────
router.get('/users', auth, async (req, res) => {
  const { rows } = await db.query(
    `SELECT u.id,u.name,u.username,u.phone,u.active,u.last_login,
            r.name AS role, b.name AS branch
     FROM users u LEFT JOIN roles r ON r.id=u.role_id LEFT JOIN branches b ON b.id=u.branch_id
     ORDER BY u.created_at DESC`
  );
  res.json(rows);
});
router.post('/users', auth, async (req, res) => {
  const { name, username, password, role_id, branch_id, phone, active } = req.body;
  if (!name || !username || !password) return res.status(400).json({ error: 'بيانات ناقصة' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      'INSERT INTO users (name,username,password,role_id,branch_id,phone,active) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id,name,username,phone,active',
      [name, username, hashed, role_id||null, branch_id||null, phone||null, active !== false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});
router.put('/users/:id', auth, async (req, res) => {
  const { name, phone, role_id, branch_id, active, password } = req.body;
  try {
    let q, vals;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      q = 'UPDATE users SET name=$1,phone=$2,role_id=$3,branch_id=$4,active=$5,password=$6 WHERE id=$7 RETURNING id,name,username,phone,active';
      vals = [name, phone||null, role_id||null, branch_id||null, active !== false, hashed, req.params.id];
    } else {
      q = 'UPDATE users SET name=$1,phone=$2,role_id=$3,branch_id=$4,active=$5 WHERE id=$6 RETURNING id,name,username,phone,active';
      vals = [name, phone||null, role_id||null, branch_id||null, active !== false, req.params.id];
    }
    const { rows } = await db.query(q, vals);
    res.json(rows[0] || {});
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

// ── REASONS ─────────────────────────────────────
router.get('/reasons', auth, async (req, res) => {
  const { rows } = await db.query('SELECT * FROM reasons ORDER BY type,name');
  res.json(rows);
});
router.post('/reasons', auth, async (req, res) => {
  const { name, type, active } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'الاسم والنوع مطلوبان' });
  const { rows } = await db.query(
    'INSERT INTO reasons (name,type,active) VALUES ($1,$2,$3) RETURNING *',
    [name, type, active !== false]
  );
  res.status(201).json(rows[0]);
});
router.put('/reasons/:id', auth, async (req, res) => {
  const { name, type, active } = req.body;
  const { rows } = await db.query(
    'UPDATE reasons SET name=$1,type=$2,active=$3 WHERE id=$4 RETURNING *',
    [name, type, active !== false, req.params.id]
  );
  res.json(rows[0] || {});
});

module.exports = router;
