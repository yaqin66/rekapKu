import { useState } from 'react';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import WalletCard from '../components/WalletCard';
import Modal from '../components/Modal';
import { WALLET_ICONS } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

const WALLET_COLORS = ['#22c55e','#2563eb','#8b5cf6','#f59e0b','#ec4899','#06b6d4','#ef4444','#00aa13'];
const ICON_OPTIONS = Object.keys(WALLET_ICONS);

function WalletForm({ onClose, editData }) {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    name: editData?.name || '',
    icon: editData?.icon || 'Wallet',
    color: editData?.color || WALLET_COLORS[0],
    balance: editData?.balance ?? 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    const payload = { ...form, balance: parseFloat(form.balance) || 0 };
    if (editData) {
      dispatch({ type: 'UPDATE_WALLET', payload: { ...payload, id: editData.id } });
    } else {
      dispatch({ type: 'ADD_WALLET', payload });
    }
    onClose();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Nama Dompet</label>
        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Bank BCA" className={inputClass} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Ikon</label>
        <div className="flex gap-2 flex-wrap">
          {ICON_OPTIONS.map(iconName => {
            const IconComp = WALLET_ICONS[iconName];
            return (
              <button key={iconName} type="button" onClick={() => setForm(f => ({ ...f, icon: iconName }))}
                className={`p-2.5 rounded-xl border-2 transition-all ${form.icon === iconName ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-transparent bg-dark-50 dark:bg-dark-700'}`}>
                <IconComp className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Warna</label>
        <div className="flex gap-2 flex-wrap">
          {WALLET_COLORS.map(color => (
            <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))}
              className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === color ? 'border-dark-900 dark:border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Saldo Awal (Rp)</label>
        <input type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} className={`${inputClass} text-lg font-semibold`} />
      </div>
      <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white gradient-primary hover:shadow-lg transition-all active:scale-[0.98]">
        {editData ? 'Simpan' : 'Tambah Dompet'}
      </button>
    </form>
  );
}

function TransferForm({ onClose }) {
  const { wallets, dispatch } = useApp();
  const [form, setForm] = useState({
    fromId: wallets[0]?.id || '',
    toId: wallets.length > 1 ? wallets[1].id : '',
    amount: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.fromId === form.toId) {
      alert('Pilih dompet tujuan yang berbeda');
      return;
    }
    const payload = { ...form, amount: parseFloat(form.amount) || 0 };
    if (payload.amount <= 0) {
      alert('Nominal harus lebih dari 0');
      return;
    }
    try {
      await dispatch({ type: 'TRANSFER_WALLET', payload });
      onClose();
    } catch (err) {
      // Errors handled by dispatch
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all";

  if (wallets.length < 2) {
    return <div className="text-center py-4 text-dark-500">Minimal harus ada 2 dompet untuk melakukan transfer.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Dari Dompet</label>
        <select value={form.fromId} onChange={e => setForm(f => ({ ...f, fromId: e.target.value }))} className={inputClass} required>
          {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Ke Dompet</label>
        <select value={form.toId} onChange={e => setForm(f => ({ ...f, toId: e.target.value }))} className={inputClass} required>
          {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">Nominal Transfer (Rp)</label>
        <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={`${inputClass} text-lg font-semibold`} required min="1" />
      </div>
      <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white gradient-primary hover:shadow-lg transition-all active:scale-[0.98]">
        Transfer Sekarang
      </button>
    </form>
  );
}

export default function Wallets() {
  const { wallets, dispatch } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  const handleEdit = (wallet) => { setEditData(wallet); setShowModal(true); };
  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus dompet ini?')) {
      dispatch({ type: 'DELETE_WALLET', payload: id });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dompet</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">Kelola semua akun keuanganmu</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTransferModal(true)} className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-100 text-dark-700 hover:bg-dark-200 dark:bg-dark-800 dark:text-dark-300 dark:hover:bg-dark-700 font-medium text-sm transition-all active:scale-95">
            <ArrowLeftRight className="w-4 h-4" /><span className="hidden sm:inline">Transfer</span>
          </button>
          <button onClick={() => { setEditData(null); setShowModal(true); }} className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:shadow-lg transition-all active:scale-95">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Tambah</span>
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="glass-card rounded-2xl p-6 text-center gradient-hero text-white">
        <p className="text-sm opacity-80 mb-1">Total Saldo Semua Dompet</p>
        <p className="text-3xl font-bold font-display">{formatCurrency(totalBalance)}</p>
        <p className="text-xs opacity-70 mt-1">{wallets.length} dompet aktif</p>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {wallets.map(wallet => (
          <WalletCard key={wallet.id} wallet={wallet} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null); }} title={editData ? 'Edit Dompet' : 'Tambah Dompet'}>
        <WalletForm onClose={() => { setShowModal(false); setEditData(null); }} editData={editData} />
      </Modal>

      <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Antar Dompet">
        <TransferForm onClose={() => setShowTransferModal(false)} />
      </Modal>
    </div>
  );
}
