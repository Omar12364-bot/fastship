const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db/pool');
const auth    = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'بيانات ناقصة' });

  try {
    const { rows } = await db.query(
      `SELECT u.*, r.name AS role_name, r.permissions, b.name AS branch_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN branches b ON b.id = u.branch_id
       WHERE u.username = $1 AND u.active = true`,
      [username]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id, name: user.name, username: user.username,
        role: user.role_name, branch: user.branch_name,
        permissions: user.permissions
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.username, u.phone, r.name AS role, b.name AS branch, r.permissions
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN branches b ON b.id = u.branch_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'مستخدم غير موجود' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

module.exports = router;
