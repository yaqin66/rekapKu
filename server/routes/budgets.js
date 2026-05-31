import express from 'express';
import pool from '../db.js';
import { verifyGoogleToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyGoogleToken);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM budgets WHERE user_email = $1 ORDER BY created_at DESC', [req.user_email]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { id, categoryId, limit } = req.body;
  try {
    await pool.query(
      'INSERT INTO budgets (id, "categoryId", "limit", user_email) VALUES ($1, $2, $3, $4)',
      [id, categoryId, limit, req.user_email]
    );
    const { rows } = await pool.query('SELECT * FROM budgets WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Budget for this category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { categoryId, limit } = req.body;
  try {
    const result = await pool.query(
      'UPDATE budgets SET "categoryId" = $1, "limit" = $2 WHERE id = $3 AND user_email = $4',
      [categoryId, limit, id, req.user_email]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Budget not found or unauthorized' });
    
    const { rows } = await pool.query('SELECT * FROM budgets WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Budget for this category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM budgets WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Budget not found or unauthorized' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
