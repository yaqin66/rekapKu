import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';

export default function TransactionForm({ onClose, editData }) {
  const { dispatch, wallets } = useApp();
  const [type, setType] = useState(editData?.type || 'expense');
  const [form, setForm] = useState({
    amount: editData?.amount || '',
    categoryId: editData?.categoryId || '',
    walletId: editData?.walletId || wallets[0]?.id || '',
    description: editData?.description || '',
    date: editData?.date || new Date().toISOString().split('T')[0],
  });

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.categoryId || !form.walletId) return;

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      type,
    };

    if (editData) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...payload, id: editData.id } });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload });
    }
    onClose();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-100 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-200 text-sm";
  const labelClass = "block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-xl bg-dark-100 dark:bg-dark-700 p-1">
        <button
          type="button"
          onClick={() => { setType('expense'); setForm(f => ({ ...f, categoryId: '' })); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            type === 'expense'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
              : 'text-dark-500 dark:text-dark-400 hover:text-dark-700'
          }`}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setForm(f => ({ ...f, categoryId: '' })); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            type === 'income'
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
              : 'text-dark-500 dark:text-dark-400 hover:text-dark-700'
          }`}
        >
          Pemasukan
        </button>
      </div>

      {/* Amount */}
      <div>
        <label className={labelClass}>Jumlah (Rp)</label>
        <input
          type="number"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
          placeholder="0"
          className={`${inputClass} text-lg font-semibold`}
          min="0"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>Kategori</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = form.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, categoryId: cat.id }))}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 text-xs ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                    : 'border-transparent bg-dark-50 dark:bg-dark-700 hover:border-dark-300 dark:hover:border-dark-500'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: cat.color + '20' }}
                >
                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <span className="text-center leading-tight line-clamp-2">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wallet */}
      <div>
        <label className={labelClass}>Dompet</label>
        <select
          value={form.walletId}
          onChange={e => setForm(f => ({ ...f, walletId: e.target.value }))}
          className={inputClass}
          required
        >
          <option value="">Pilih dompet</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className={labelClass}>Tanggal</label>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          className={inputClass}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Keterangan</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Contoh: Makan siang di kantin"
          className={inputClass}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98] gradient-primary"
      >
        {editData ? 'Simpan Perubahan' : 'Tambah Transaksi'}
      </button>
    </form>
  );
}
