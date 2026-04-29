import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BudgetCard from '../components/BudgetCard';
import Modal from '../components/Modal';
import { EXPENSE_CATEGORIES } from '../utils/categories';
import { formatCurrency, getMonthName } from '../utils/formatters';

function BudgetForm({ onClose, editData, existingCategoryIds }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    categoryId: editData?.categoryId || '',
    limit: editData?.limit || '',
  });

  const availableCategories = EXPENSE_CATEGORIES.filter(
    cat => !existingCategoryIds.includes(cat.id) || cat.id === editData?.categoryId
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.categoryId || !form.limit) return;
    const payload = { ...form, limit: parseFloat(form.limit) };
    if (editData) {
      dispatch({ type: 'UPDATE_BUDGET', payload: { ...payload, id: editData.id } });
    } else {
      dispatch({ type: 'ADD_BUDGET', payload });
    }
    onClose();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Kategori</label>
        <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto">
          {availableCategories.map(cat => {
            const Icon = cat.icon;
            const isSelected = form.categoryId === cat.id;
            return (
              <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, categoryId: cat.id }))}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-xs ${isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-transparent bg-dark-50 dark:bg-dark-700 hover:border-dark-300'}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <span className="text-center leading-tight line-clamp-2">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Batas Anggaran (Rp)</label>
        <input type="number" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} placeholder="500000" className={`${inputClass} text-lg font-semibold`} min="0" required />
      </div>
      <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white gradient-primary hover:shadow-lg transition-all active:scale-[0.98]">
        {editData ? 'Simpan' : 'Tambah Anggaran'}
      </button>
    </form>
  );
}

export default function Budget() {
  const { budgets, dispatch, getCategorySpending } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalBudget = useMemo(() => budgets.reduce((s, b) => s + b.limit, 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((s, b) => s + getCategorySpending(b.categoryId, currentYear, currentMonth), 0), [budgets, getCategorySpending, currentYear, currentMonth]);

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus anggaran ini?')) {
      dispatch({ type: 'DELETE_BUDGET', payload: id });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Anggaran</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">Pantau anggaran — {getMonthName(currentMonth)} {currentYear}</p>
        </div>
        <button onClick={() => { setEditData(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:shadow-lg transition-all active:scale-95">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Total Anggaran</p><p className="font-bold text-lg font-display">{formatCurrency(totalBudget)}</p></div>
          <div><p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Terpakai</p><p className="font-bold text-lg font-display text-red-500">{formatCurrency(totalSpent)}</p></div>
          <div><p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Sisa</p><p className={`font-bold text-lg font-display ${totalBudget - totalSpent >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500'}`}>{formatCurrency(totalBudget - totalSpent)}</p></div>
        </div>
        {totalBudget > 0 && (
          <div className="mt-4">
            <div className="w-full h-3 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`, background: totalSpent > totalBudget ? '#ef4444' : 'linear-gradient(90deg, #22c55e, #16a34a)' }} />
            </div>
            <p className="text-xs text-dark-400 mt-1 text-right">{((totalSpent / totalBudget) * 100).toFixed(1)}% terpakai</p>
          </div>
        )}
      </div>

      {budgets.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Plus className="w-12 h-12 mx-auto text-dark-300 dark:text-dark-600 mb-3" />
          <p className="font-medium">Belum ada anggaran</p>
          <p className="text-sm text-dark-400 mt-1">Mulai buat anggaran untuk mengontrol pengeluaranmu</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm">Buat Anggaran</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {budgets.map(budget => (
            <BudgetCard key={budget.id} budget={budget} spent={getCategorySpending(budget.categoryId, currentYear, currentMonth)} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null); }} title={editData ? 'Edit Anggaran' : 'Tambah Anggaran'}>
        <BudgetForm onClose={() => { setShowModal(false); setEditData(null); }} editData={editData} existingCategoryIds={budgets.map(b => b.categoryId)} />
      </Modal>
    </div>
  );
}
