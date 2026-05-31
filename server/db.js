import pg from 'pg';
import dotenv from 'dotenv';
import { DEFAULT_WALLETS } from '../src/utils/categories.js';

dotenv.config();

// Memaksa driver pg untuk mengonversi tipe NUMERIC PostgreSQL menjadi Number di JavaScript
// Ini menghindari error NaN (Not a Number) di frontend karena pg secara default mengembalikan string.
pg.types.setTypeParser(1700, function(val) {
  return parseFloat(val);
});

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Inisialisasi skema tabel
const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        password TEXT,
        picture TEXT,
        last_login TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT DEFAULT 'Wallet',
        color TEXT DEFAULT '#22c55e',
        balance NUMERIC(15,2) DEFAULT 0,
        user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('income','expense')),
        amount NUMERIC(15,2) NOT NULL,
        "categoryId" TEXT NOT NULL,
        "walletId" TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY ("walletId") REFERENCES wallets(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        "categoryId" TEXT NOT NULL,
        "limit" NUMERIC(15,2) NOT NULL,
        user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE("categoryId", user_email)
      );

      CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        "dueDate" INTEGER NOT NULL,
        "categoryId" TEXT NOT NULL,
        "walletId" TEXT NOT NULL,
        user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY ("walletId") REFERENCES wallets(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        "targetAmount" NUMERIC(15,2) NOT NULL,
        "currentAmount" NUMERIC(15,2) DEFAULT 0,
        deadline TEXT NOT NULL,
        color TEXT DEFAULT '#3b82f6',
        icon TEXT DEFAULT 'Target',
        user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS debts (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK(type IN ('debt','receivable')),
        name TEXT NOT NULL,
        amount NUMERIC(15,2) NOT NULL,
        "remainingAmount" NUMERIC(15,2) NOT NULL,
        "dueDate" TEXT,
        user_email TEXT REFERENCES users(email) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Jika tabel sudah ada dari sebelumnya (sebelum login fitur dibuat), tambahkan kolom user_email
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
      ALTER TABLE wallets ADD COLUMN IF NOT EXISTS user_email TEXT;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_email TEXT;
      ALTER TABLE budgets ADD COLUMN IF NOT EXISTS user_email TEXT;
      ALTER TABLE bills ADD COLUMN IF NOT EXISTS user_email TEXT;
      ALTER TABLE goals ADD COLUMN IF NOT EXISTS user_email TEXT;
      ALTER TABLE debts ADD COLUMN IF NOT EXISTS user_email TEXT;

    `);

    // Seed default wallets jika kosong
    const { rows } = await client.query('SELECT COUNT(*) as count FROM wallets');
    if (parseInt(rows[0].count) === 0) {
      for (const w of DEFAULT_WALLETS) {
        await client.query(
          'INSERT INTO wallets (id, name, icon, color, balance) VALUES ($1, $2, $3, $4, $5)',
          [w.id, w.name, w.icon, w.color, w.balance]
        );
      }
      console.log('Default wallets inserted.');
    }

    console.log('✅ Database PostgreSQL siap.');
  } catch (err) {
    console.error('❌ Gagal inisialisasi database:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

initDB().catch((err) => {
  console.error('Database initialization failed. Pastikan PostgreSQL berjalan dan DATABASE_URL di .env sudah benar.');
  process.exit(1);
});

export default pool;
