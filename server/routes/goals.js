import express from 'express';
import pool from '../db.js';
import { verifyGoogleToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyGoogleToken);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM goals WHERE user_email = $1 ORDER BY created_at DESC', [req.user_email]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { id, name, targetAmount, currentAmount, deadline, color, icon } = req.body;
  try {
    await pool.query(
      'INSERT INTO goals (id, name, "targetAmount", "currentAmount", deadline, color, icon, user_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, name, targetAmount, currentAmount || 0, deadline, color, icon, req.user_email]
    );
    const { rows } = await pool.query('SELECT * FROM goals WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, targetAmount, currentAmount, deadline, color, icon } = req.body;
  try {
    const result = await pool.query(
      'UPDATE goals SET name = $1, "targetAmount" = $2, "currentAmount" = $3, deadline = $4, color = $5, icon = $6 WHERE id = $7 AND user_email = $8',
      [name, targetAmount, currentAmount, deadline, color, icon, id, req.user_email]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Goal not found or unauthorized' });
    
    const { rows } = await pool.query('SELECT * FROM goals WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM goals WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Goal not found or unauthorized' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
