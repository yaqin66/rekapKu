import express from 'express';
import pool from '../db.js';
import { verifyGoogleToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyGoogleToken);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bills WHERE user_email = $1 ORDER BY created_at DESC', [req.user_email]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { id, name, amount, dueDate, categoryId, walletId } = req.body;
  try {
    await pool.query(
      'INSERT INTO bills (id, name, amount, "dueDate", "categoryId", "walletId", user_email) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, name, amount, dueDate, categoryId, walletId, req.user_email]
    );
    const { rows } = await pool.query('SELECT * FROM bills WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, amount, dueDate, categoryId, walletId } = req.body;
  try {
    const result = await pool.query(
      'UPDATE bills SET name = $1, amount = $2, "dueDate" = $3, "categoryId" = $4, "walletId" = $5 WHERE id = $6 AND user_email = $7',
      [name, amount, dueDate, categoryId, walletId, id, req.user_email]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Bill not found or unauthorized' });
    
    const { rows } = await pool.query('SELECT * FROM bills WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM bills WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Bill not found or unauthorized' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
