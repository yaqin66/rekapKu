"""
Script migrasi data dari rekapku.db (SQLite3) ke PostgreSQL.
Script ini akan:
  1. Membuat semua tabel yang dibutuhkan (CREATE TABLE IF NOT EXISTS)
  2. Memigrasikan semua data dari SQLite ke PostgreSQL

Cara pakai:
  pip install psycopg2-binary python-dotenv
  python migrate_data.py
"""

import sqlite3
import psycopg2
import os
from dotenv import load_dotenv

# Baca DATABASE_URL dari .env
load_dotenv()

# ─── Konfigurasi ──────────────────────────────────────────────────────────────
SQLITE_PATH = "rekapku.db"
PG_DSN = os.environ.get("DATABASE_URL", "postgresql://rekapku:r3k4pKu!@192.168.2.87:5432/rekapku")
# ──────────────────────────────────────────────────────────────────────────────

CREATE_TABLES_SQL = """
CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'Wallet',
    color TEXT DEFAULT '#22c55e',
    balance NUMERIC(15,2) DEFAULT 0,
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY ("walletId") REFERENCES wallets(id)
);

CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    "categoryId" TEXT NOT NULL UNIQUE,
    "limit" NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    "dueDate" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY ("walletId") REFERENCES wallets(id)
);

CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "targetAmount" NUMERIC(15,2) NOT NULL,
    "currentAmount" NUMERIC(15,2) DEFAULT 0,
    deadline TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT DEFAULT 'Target',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('debt','receivable')),
    name TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    "remainingAmount" NUMERIC(15,2) NOT NULL,
    "dueDate" TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_walletid ON transactions("walletId");
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_walletid ON bills("walletId");
"""

# Mapping: nama tabel → kolom yang akan dimigrasikan (sesuai urutan)
TABLES = {
    "wallets":      ["id", "name", "icon", "color", "balance", "created_at"],
    "transactions": ["id", "type", "amount", "categoryId", "walletId", "description", "date", "created_at"],
    "budgets":      ["id", "categoryId", "limit", "created_at"],
    "bills":        ["id", "name", "amount", "dueDate", "categoryId", "walletId", "created_at"],
    "goals":        ["id", "name", "targetAmount", "currentAmount", "deadline", "color", "icon", "created_at"],
    "debts":        ["id", "type", "name", "amount", "remainingAmount", "dueDate", "created_at"],
}

# Kolom camelCase & reserved words harus dikutip di PostgreSQL
QUOTED_COLS = {"categoryId", "walletId", "dueDate", "targetAmount", "currentAmount", "remainingAmount", "limit"}


def quote_col(col):
    return f'"{col}"' if col in QUOTED_COLS else col


def main():
    if not os.path.exists(SQLITE_PATH):
        print(f"❌ File SQLite tidak ditemukan: {SQLITE_PATH}")
        return

    print(f"📂 Membaca dari: {SQLITE_PATH}")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row

    print(f"🐘 Menghubungkan ke PostgreSQL ({PG_DSN.split('@')[-1]})...")
    try:
        pg_conn = psycopg2.connect(PG_DSN)
    except Exception as e:
        print(f"❌ Gagal koneksi PostgreSQL: {e}")
        return

    pg_cur = pg_conn.cursor()

    # ── Step 1: Buat semua tabel ──────────────────────────────────────────────
    print("\n📋 Membuat tabel (jika belum ada)...")
    try:
        pg_cur.execute(CREATE_TABLES_SQL)
        pg_conn.commit()
        print("✅ Semua tabel siap.\n")
    except Exception as e:
        pg_conn.rollback()
        print(f"❌ Gagal membuat tabel: {e}")
        pg_conn.close()
        sqlite_conn.close()
        return

    # ── Step 2: Migrasi data per tabel ───────────────────────────────────────
    total_migrated = 0

    for table, cols in TABLES.items():
        try:
            rows = sqlite_conn.execute(f"SELECT * FROM {table}").fetchall()
        except Exception as e:
            print(f"[SKIP] {table} — Error baca SQLite: {e}")
            continue

        if not rows:
            print(f"[SKIP] {table} — kosong")
            continue

        pg_cols     = ", ".join(quote_col(c) for c in cols)
        placeholders = ", ".join(["%s"] * len(cols))
        sql = f'INSERT INTO {table} ({pg_cols}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING'

        count = 0
        skipped = 0
        for row in rows:
            values = [row[c] if c in row.keys() else None for c in cols]
            try:
                # Gunakan SAVEPOINT per baris agar error satu baris
                # tidak membatalkan seluruh transaksi tabel
                pg_cur.execute("SAVEPOINT sp")
                pg_cur.execute(sql, values)
                pg_cur.execute("RELEASE SAVEPOINT sp")
                count += 1
            except Exception as e:
                pg_cur.execute("ROLLBACK TO SAVEPOINT sp")
                skipped += 1
                print(f"  ⚠️  Lewati baris di {table} (id={row['id']}): {e}")

        pg_conn.commit()
        status = f"{count}/{len(rows)} baris"
        if skipped > 0:
            status += f" ({skipped} dilewati)"
        print(f"[OK] {table} — {status}")
        total_migrated += count

    pg_cur.close()
    pg_conn.close()
    sqlite_conn.close()

    print(f"\n✅ Migrasi selesai! Total {total_migrated} baris berhasil dipindahkan ke PostgreSQL.")


if __name__ == "__main__":
    main()
