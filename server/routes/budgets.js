import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all budgets
router.get('/', (req, res) => {
  try {
    const budgets = db.prepare('SELECT * FROM budgets').all();
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new budget
router.post('/', (req, res) => {
  const { id, categoryId, limit } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO budgets (id, categoryId, "limit") VALUES (?, ?, ?)');
    stmt.run(id, categoryId, limit);
    const newBudget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    res.status(201).json(newBudget);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
       return res.status(400).json({ error: 'Budget for this category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT (update) a budget
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { categoryId, limit } = req.body;
  try {
    const stmt = db.prepare('UPDATE budgets SET categoryId = ?, "limit" = ? WHERE id = ?');
    const result = stmt.run(categoryId, limit, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    const updatedBudget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    res.json(updatedBudget);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
       return res.status(400).json({ error: 'Budget for this category already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE a budget
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM budgets WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
