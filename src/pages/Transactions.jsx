import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import Modal from '../components/Modal';
import { formatCurrency } from '../utils/formatters';

export default function Transactions() {
  const { transactions, dispatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Filter by month
    if (filterMonth) {
      const [y, m] = filterMonth.split('-').map(Number);
      result = result.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === y && d.getMonth() === m - 1;
      });
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.categoryId?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterType, filterMonth, search]);

  const monthTotals = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [filteredTransactions]);

  const handleEdit = (tx) => {
    setEditData(tx);
    setShowAddModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditData(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Transaksi</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
            Kelola semua pemasukan & pengeluaranmu
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* Month totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-white text-lg">↑</span>
          </div>
          <div>
            <p className="text-xs text-dark-500 dark:text-dark-400">Pemasukan</p>
            <p className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(monthTotals.income)}</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-danger flex items-center justify-center">
            <span className="text-white text-lg">↓</span>
          </div>
          <div>
            <p className="text-xs text-dark-500 dark:text-dark-400">Pengeluaran</p>
            <p className="font-bold text-red-500 dark:text-red-400">{formatCurrency(monthTotals.expense)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari transaksi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              id="search-transactions"
            />
          </div>

          {/* Month filter */}
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
          />

          {/* Type filter */}
          <div className="flex rounded-xl bg-dark-100 dark:bg-dark-700 p-1">
            {['all', 'income', 'expense'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === t
                    ? 'bg-white dark:bg-dark-600 text-dark-900 dark:text-dark-100 shadow-sm'
                    : 'text-dark-500'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'income' ? 'Masuk' : 'Keluar'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <TransactionList
        transactions={filteredTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={editData ? 'Edit Transaksi' : 'Tambah Transaksi'}
      >
        <TransactionForm onClose={handleCloseModal} editData={editData} />
      </Modal>
    </div>
  );
}
