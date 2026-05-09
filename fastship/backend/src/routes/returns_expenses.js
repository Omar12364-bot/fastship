// ══ RETURNS ══════════════════════════════════════
const express = require('express');
const db   = require('../db/pool');
const auth = require('../middleware/auth');

const returnsRouter = express.Router();

returnsRouter.get('/', auth, async (req, res) => {
  try {
    const { status, merchant_id, q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conds = [], vals = []; let i = 1;
    if (status)      { conds.push(`r.status=$${i++}`);       vals.push(status); }
    if (merchant_id) { conds.push(`r.merchant_id=$${i++}`);  vals.push(merchant_id); }
    if (q)           { conds.push(`(r.req_no ILIKE $${i} OR r.bill_no ILIKE $${i})`); vals.push(`%${q}%`); i++; }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const { rows } = await db.query(
      `SELECT r.*, m.name AS merchant_name
       FROM returns r LEFT JOIN merchants m ON m.id=r.merchant_id
       ${where} ORDER BY r.created_at DESC LIMIT $${i} OFFSET $${i+1}`,
      [...vals, limit, offset]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

returnsRouter.post('/', auth, async (req, res) => {
  const { bill_no, merchant_id, reason, status, notes } = req.body;
  if (!bill_no || !reason) return res.status(400).json({ error: 'رقم الشحنة والسبب مطلوبان' });
  try {
    const req_no = 'RET-' + Date.now().toString().slice(-5);
    const { rows: ship } = await db.query('SELECT id FROM shipments WHERE bill_no=$1', [bill_no]);
    const { rows } = await db.query(
      `INSERT INTO returns (req_no,shipment_id,bill_no,merchant_id,reason,status,notes,created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req_no, ship[0]?.id||null, bill_no, merchant_id||null, reason,
       status||'في الانتظار', notes||null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

returnsRouter.put('/:id', auth, async (req, res) => {
  const { bill_no, merchant_id, reason, status, notes } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE returns SET bill_no=$1,merchant_id=$2,reason=$3,status=$4,notes=$5
       WHERE id=$6 RETURNING *`,
      [bill_no, merchant_id||null, reason, status, notes||null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

returnsRouter.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM returns WHERE id=$1', [req.params.id]);
    res.json({ message: 'تم الحذف' });
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

// ══ EXPENSES ═════════════════════════════════════
const expensesRouter = express.Router();

expensesRouter.get('/', auth, async (req, res) => {
  try {
    const { type, branch_id, date_from, date_to, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conds = [], vals = []; let i = 1;
    if (type)      { conds.push(`e.type=$${i++}`);        vals.push(type); }
    if (branch_id) { conds.push(`e.branch_id=$${i++}`);   vals.push(branch_id); }
    if (date_from) { conds.push(`e.date>=$${i++}`);       vals.push(date_from); }
    if (date_to)   { conds.push(`e.date<=$${i++}`);       vals.push(date_to); }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const [{ rows }, { rows: tot }] = await Promise.all([
      db.query(
        `SELECT e.*, b.name AS branch_name
         FROM expenses e LEFT JOIN branches b ON b.id=e.branch_id
         ${where} ORDER BY e.date DESC LIMIT $${i} OFFSET $${i+1}`,
        [...vals, limit, offset]
      ),
      db.query(`SELECT COALESCE(SUM(amount),0) AS total FROM expenses e ${where}`, vals)
    ]);
    res.json({ data: rows, total_amount: tot[0].total });
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

expensesRouter.post('/', auth, async (req, res) => {
  const { type, amount, branch_id, date, notes } = req.body;
  if (!type || !amount || !date)
    return res.status(400).json({ error: 'النوع والمبلغ والتاريخ مطلوبة' });
  try {
    const { rows } = await db.query(
      `INSERT INTO expenses (type,amount,branch_id,date,notes,created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [type, amount, branch_id||null, date, notes||null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

expensesRouter.put('/:id', auth, async (req, res) => {
  const { type, amount, branch_id, date, notes } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE expenses SET type=$1,amount=$2,branch_id=$3,date=$4,notes=$5
       WHERE id=$6 RETURNING *`,
      [type, amount, branch_id||null, date, notes||null, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'المصروف غير موجود' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

expensesRouter.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM expenses WHERE id=$1', [req.params.id]);
    res.json({ message: 'تم الحذف' });
  } catch (err) { res.status(500).json({ error: 'خطأ في الخادم' }); }
});

module.exports = { returnsRouter, expensesRouter };
