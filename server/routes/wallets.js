import express from 'express';
import pool from '../db.js';
import { verifyGoogleToken } from '../middleware/auth.js';

const router = express.Router();

// Semua rute dompet wajib menyertakan token Google
router.use(verifyGoogleToken);

// GET all wallets for current user
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM wallets WHERE user_email = $1 ORDER BY created_at ASC',
      [req.user_email]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new wallet
router.post('/', async (req, res) => {
  const { id, name, icon, color, balance } = req.body;
  try {
    await pool.query(
      'INSERT INTO wallets (id, name, icon, color, balance, user_email) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, icon, color, balance || 0, req.user_email]
    );
    const { rows } = await pool.query('SELECT * FROM wallets WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a transfer between wallets
router.post('/transfer', async (req, res) => {
  const { fromId, toId, amount } = req.body;
  if (!fromId || !toId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid transfer data' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [fromWallet] } = await client.query('SELECT balance FROM wallets WHERE id = $1 AND user_email = $2', [fromId, req.user_email]);
    const { rows: [toWallet] } = await client.query('SELECT balance FROM wallets WHERE id = $1 AND user_email = $2', [toId, req.user_email]);

    if (!fromWallet || !toWallet) throw new Error('Wallet not found or unauthorized');
    if (parseFloat(fromWallet.balance) < amount) throw new Error('Insufficient balance');

    await client.query('UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND user_email = $3', [amount, fromId, req.user_email]);
    await client.query('UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_email = $3', [amount, toId, req.user_email]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// PUT (update) a wallet
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, icon, color, balance } = req.body;
  try {
    const result = await pool.query(
      'UPDATE wallets SET name = $1, icon = $2, color = $3, balance = $4 WHERE id = $5 AND user_email = $6',
      [name, icon, color, balance, id, req.user_email]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Wallet not found or unauthorized' });
    }
    const { rows } = await pool.query('SELECT * FROM wallets WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a wallet
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT COUNT(*) as count FROM transactions WHERE "walletId" = $1 AND user_email = $2',
      [id, req.user_email]
    );
    if (parseInt(rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete wallet with existing transactions' });
    }

    const result = await pool.query('DELETE FROM wallets WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Wallet not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
