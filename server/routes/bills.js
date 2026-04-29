import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const bills = db.prepare('SELECT * FROM bills ORDER BY created_at DESC').all();
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', (req, res) => {
  const { id, name, amount, dueDate, categoryId, walletId } = req.body;
  try {
    db.prepare('INSERT INTO bills (id, name, amount, dueDate, categoryId, walletId) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, name, amount, dueDate, categoryId, walletId);
    const newBill = db.prepare('SELECT * FROM bills WHERE id = ?').get(id);
    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, amount, dueDate, categoryId, walletId } = req.body;
  try {
    db.prepare('UPDATE bills SET name = ?, amount = ?, dueDate = ?, categoryId = ?, walletId = ? WHERE id = ?')
      .run(name, amount, dueDate, categoryId, walletId, id);
    const updatedBill = db.prepare('SELECT * FROM bills WHERE id = ?').get(id);
    if (!updatedBill) return res.status(404).json({ error: 'Bill not found' });
    res.json(updatedBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM bills WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'Bill not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
