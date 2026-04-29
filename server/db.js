import Database from 'better-sqlite3';
import { DEFAULT_WALLETS } from '../src/utils/categories.js';

// Initialize the database
const db = new Database('rekapku.db', { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Wallet',
    color TEXT DEFAULT '#22c55e',
    balance REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('income','expense')),
    amount REAL NOT NULL,
    categoryId TEXT NOT NULL,
    walletId TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (walletId) REFERENCES wallets(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    categoryId TEXT NOT NULL UNIQUE,
    "limit" REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    dueDate INTEGER NOT NULL,
    categoryId TEXT NOT NULL,
    walletId TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (walletId) REFERENCES wallets(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    targetAmount REAL NOT NULL,
    currentAmount REAL DEFAULT 0,
    deadline TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'Target',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS debts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('debt','receivable')),
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    remainingAmount REAL NOT NULL,
    dueDate TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default wallets if the table is empty
const walletCount = db.prepare('SELECT COUNT(*) as count FROM wallets').get().count;

if (walletCount === 0) {
  const insertWallet = db.prepare('INSERT INTO wallets (id, name, icon, color, balance) VALUES (?, ?, ?, ?, ?)');
  const insertMany = db.transaction((wallets) => {
    for (const wallet of wallets) {
      insertWallet.run(wallet.id, wallet.name, wallet.icon, wallet.color, wallet.balance);
    }
  });
  insertMany(DEFAULT_WALLETS);
  console.log('Inserted default wallets into the database.');
}

export default db;
