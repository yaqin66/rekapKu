import express from 'express';
import pool from '../db.js';
import { verifyGoogleToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyGoogleToken);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM debts WHERE user_email = $1 ORDER BY created_at DESC', [req.user_email]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { id, type, name, amount, remainingAmount, dueDate } = req.body;
  try {
    await pool.query(
      'INSERT INTO debts (id, type, name, amount, "remainingAmount", "dueDate", user_email) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, type, name, amount, remainingAmount !== undefined ? remainingAmount : amount, dueDate, req.user_email]
    );
    const { rows } = await pool.query('SELECT * FROM debts WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, name, amount, remainingAmount, dueDate } = req.body;
  try {
    const result = await pool.query(
      'UPDATE debts SET type = $1, name = $2, amount = $3, "remainingAmount" = $4, "dueDate" = $5 WHERE id = $6 AND user_email = $7',
      [type, name, amount, remainingAmount, dueDate, id, req.user_email]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Debt not found or unauthorized' });
    
    const { rows } = await pool.query('SELECT * FROM debts WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM debts WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Debt not found or unauthorized' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
