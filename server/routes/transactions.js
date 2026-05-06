import express from 'express';
import pool from '../db.js';
import { verifyGoogleToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyGoogleToken);

// GET all transactions for current user
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC, created_at DESC',
      [req.user_email]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new transaction
router.post('/', async (req, res) => {
  const { id, type, amount, categoryId, walletId, description, date } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Pastikan wallet milik user ini
    const { rows: [wallet] } = await client.query('SELECT * FROM wallets WHERE id = $1 AND user_email = $2', [walletId, req.user_email]);
    if (!wallet) throw new Error('Wallet not found or unauthorized');

    await client.query(
      'INSERT INTO transactions (id, type, amount, "categoryId", "walletId", description, date, user_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, type, amount, categoryId, walletId, description, date, req.user_email]
    );

    const balanceChange = type === 'income' ? amount : -amount;
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_email = $3',
      [balanceChange, walletId, req.user_email]
    );

    await client.query('COMMIT');

    const { rows } = await pool.query('SELECT * FROM transactions WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.status(201).json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// PUT (update) a transaction
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, amount, categoryId, walletId, description, date } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [oldTx] } = await client.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_email = $2',
      [id, req.user_email]
    );
    if (!oldTx) throw new Error('Transaction not found or unauthorized');

    // Pastikan wallet baru (jika diubah) milik user ini
    const { rows: [newWallet] } = await client.query('SELECT * FROM wallets WHERE id = $1 AND user_email = $2', [walletId, req.user_email]);
    if (!newWallet) throw new Error('Target wallet not found or unauthorized');

    // Balik efek lama
    const oldBalanceChange = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_email = $3',
      [oldBalanceChange, oldTx.walletId, req.user_email]
    );

    // Terapkan efek baru
    const newBalanceChange = type === 'income' ? amount : -amount;
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_email = $3',
      [newBalanceChange, walletId, req.user_email]
    );

    await client.query(
      'UPDATE transactions SET type = $1, amount = $2, "categoryId" = $3, "walletId" = $4, description = $5, date = $6 WHERE id = $7 AND user_email = $8',
      [type, amount, categoryId, walletId, description, date, id, req.user_email]
    );

    await client.query('COMMIT');

    const { rows } = await pool.query('SELECT * FROM transactions WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    res.json(rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// DELETE a transaction
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [oldTx] } = await client.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_email = $2',
      [id, req.user_email]
    );
    if (!oldTx) throw new Error('Transaction not found or unauthorized');

    const oldBalanceChange = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_email = $3',
      [oldBalanceChange, oldTx.walletId, req.user_email]
    );

    await client.query('DELETE FROM transactions WHERE id = $1 AND user_email = $2', [id, req.user_email]);
    await client.query('COMMIT');
    res.status(204).send();
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;
