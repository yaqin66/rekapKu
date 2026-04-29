import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const debts = db.prepare('SELECT * FROM debts ORDER BY created_at DESC').all();
    res.json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  const { id, type, name, amount, remainingAmount, dueDate } = req.body;
  try {
    db.prepare('INSERT INTO debts (id, type, name, amount, remainingAmount, dueDate) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, type, name, amount, remainingAmount !== undefined ? remainingAmount : amount, dueDate);
    const newDebt = db.prepare('SELECT * FROM debts WHERE id = ?').get(id);
    res.status(201).json(newDebt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { type, name, amount, remainingAmount, dueDate } = req.body;
  try {
    db.prepare('UPDATE debts SET type = ?, name = ?, amount = ?, remainingAmount = ?, dueDate = ? WHERE id = ?')
      .run(type, name, amount, remainingAmount, dueDate, id);
    const updatedDebt = db.prepare('SELECT * FROM debts WHERE id = ?').get(id);
    if (!updatedDebt) return res.status(404).json({ error: 'Debt not found' });
    res.json(updatedDebt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM debts WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Debt not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
