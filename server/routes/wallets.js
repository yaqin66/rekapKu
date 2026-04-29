import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all wallets
router.get('/', (req, res) => {
  try {
    const wallets = db.prepare('SELECT * FROM wallets').all();
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new wallet
router.post('/', (req, res) => {
  const { id, name, icon, color, balance } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO wallets (id, name, icon, color, balance) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, name, icon, color, balance || 0);
    const newWallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(id);
    res.status(201).json(newWallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a transfer between wallets
router.post('/transfer', (req, res) => {
  const { fromId, toId, amount } = req.body;
  if (!fromId || !toId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer data' });
  }

  try {
    const transferTransaction = db.transaction(() => {
      // Check if wallets exist and have enough balance (optional, but good practice)
      const fromWallet = db.prepare('SELECT balance FROM wallets WHERE id = ?').get(fromId);
      const toWallet = db.prepare('SELECT balance FROM wallets WHERE id = ?').get(toId);

      if (!fromWallet || !toWallet) throw new Error('Wallet not found');
      if (fromWallet.balance < amount) throw new Error('Insufficient balance');

      db.prepare('UPDATE wallets SET balance = balance - ? WHERE id = ?').run(amount, fromId);
      db.prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?').run(amount, toId);
    });

    transferTransaction();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT (update) a wallet
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, icon, color, balance } = req.body;
  try {
    const stmt = db.prepare('UPDATE wallets SET name = ?, icon = ?, color = ?, balance = ? WHERE id = ?');
    const result = stmt.run(name, icon, color, balance, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    const updatedWallet = db.prepare('SELECT * FROM wallets WHERE id = ?').get(id);
    res.json(updatedWallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a wallet
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    // First, check if there are any transactions associated with this wallet
    const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE walletId = ?').get(id).count;
    if (txCount > 0) {
      return res.status(400).json({ error: 'Cannot delete wallet with existing transactions' });
    }

    const stmt = db.prepare('DELETE FROM wallets WHERE id = ?');
    const result = stmt.run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
