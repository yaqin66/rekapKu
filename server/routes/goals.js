import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const goals = db.prepare('SELECT * FROM goals ORDER BY created_at DESC').all();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  const { id, name, targetAmount, currentAmount, deadline, color, icon } = req.body;
  try {
    db.prepare('INSERT INTO goals (id, name, targetAmount, currentAmount, deadline, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, targetAmount, currentAmount || 0, deadline, color, icon);
    const newGoal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, targetAmount, currentAmount, deadline, color, icon } = req.body;
  try {
    db.prepare('UPDATE goals SET name = ?, targetAmount = ?, currentAmount = ?, deadline = ?, color = ?, icon = ? WHERE id = ?')
      .run(name, targetAmount, currentAmount, deadline, color, icon, id);
    const updatedGoal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    if (!updatedGoal) return res.status(404).json({ error: 'Goal not found' });
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM goals WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Goal not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
