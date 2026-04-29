import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all transactions
router.get('/', (req, res) => {
  try {
    const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC, created_at DESC').all();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new transaction
router.post('/', (req, res) => {
  const { id, type, amount, categoryId, walletId, description, date } = req.body;
  
  const insertTransaction = db.prepare(
    'INSERT INTO transactions (id, type, amount, categoryId, walletId, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  
  const updateWallet = db.prepare(
    'UPDATE wallets SET balance = balance + ? WHERE id = ?'
  );

  try {
    // Run in a transaction so if wallet update fails, transaction isn't added
    const addTransaction = db.transaction(() => {
      insertTransaction.run(id, type, amount, categoryId, walletId, description, date);
      
      const balanceChange = type === 'income' ? amount : -amount;
      updateWallet.run(balanceChange, walletId);
      
      return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    });

    const newTx = addTransaction();
    res.status(201).json(newTx);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (update) a transaction
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { type, amount, categoryId, walletId, description, date } = req.body;

  try {
    const updateTx = db.transaction(() => {
      // Get old transaction to reverse its effect
      const oldTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
      if (!oldTx) {
        throw new Error('Transaction not found');
      }

      // Reverse old effect
      const oldBalanceChange = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
      db.prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?').run(oldBalanceChange, oldTx.walletId);

      // Apply new effect
      const newBalanceChange = type === 'income' ? amount : -amount;
      db.prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?').run(newBalanceChange, walletId);

      // Update transaction
      db.prepare(
        'UPDATE transactions SET type = ?, amount = ?, categoryId = ?, walletId = ?, description = ?, date = ? WHERE id = ?'
      ).run(type, amount, categoryId, walletId, description, date, id);

      return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    });

    const updatedTx = updateTx();
    res.json(updatedTx);
  } catch (error) {
    if (error.message === 'Transaction not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE a transaction
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const deleteTx = db.transaction(() => {
      const oldTx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
      if (!oldTx) {
        throw new Error('Transaction not found');
      }

      // Reverse effect
      const oldBalanceChange = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
      db.prepare('UPDATE wallets SET balance = balance + ? WHERE id = ?').run(oldBalanceChange, oldTx.walletId);

      db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
      return true;
    });

    deleteTx();
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Transaction not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
