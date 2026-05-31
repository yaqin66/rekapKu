import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { Plus, Edit2, Trash2, CalendarClock } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function Bills() {
  const { bills, wallets, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: 1,
    categoryId: 'utilities',
    walletId: wallets[0]?.id || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      dueDate: parseInt(formData.dueDate)
    };
    
    if (editingBill) {
      await dispatch({ type: 'UPDATE_BILL', payload: { ...data, id: editingBill.id } });
    } else {
      await dispatch({ type: 'ADD_BILL', payload: data });
    }
    
    setIsModalOpen(false);
    setEditingBill(null);
    setFormData({ name: '', amount: '', dueDate: 1, categoryId: 'utilities', walletId: wallets[0]?.id || '' });
  };

  const openEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name,
      amount: bill.amount,
      dueDate: bill.dueDate,
      categoryId: bill.categoryId,
      walletId: bill.walletId
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch({ type: 'DELETE_BILL', payload: deleteId });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Tagihan & Berlangganan</h1>
          <p className="text-dark-500 dark:text-dark-400">Kelola tagihan rutin bulanan Anda.</p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null);
            setFormData({ name: '', amount: '', dueDate: 1, categoryId: 'utilities', walletId: wallets[0]?.id || '' });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center cursor-pointer btn btn-primary w-60 h-15 px-3 py-1 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Tagihan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map(bill => (
          <div key={bill.id} className="card p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{bill.name}</h3>
                  <p className="text-sm text-dark-500">Tgl Jatuh Tempo: {bill.dueDate}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-dark-100 dark:border-dark-700 flex justify-between items-center">
              <span className="font-display font-bold text-lg text-danger-500">
                {formatCurrency(bill.amount)}
              </span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(bill)} className="p-2 text-dark-400 hover:text-primary-500 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(bill.id)} className="p-2 text-dark-400 hover:text-danger-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bills.length === 0 && (
        <div className="text-center py-12 text-dark-400">
          Belum ada tagihan yang dicatat.
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBill ? "Edit Tagihan" : "Tambah Tagihan Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Tagihan</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Listrik, Netflix"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jumlah</label>
            <input
              type="number"
              required
              min="0"
              className="input w-full"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Jatuh Tempo (1-31)</label>
            <input
              type="number"
              required
              min="1"
              max="31"
              className="input w-full"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dompet Sumber Dana</label>
            <select
              required
              className="input w-full"
              value={formData.walletId}
              onChange={e => setFormData({ ...formData, walletId: e.target.value })}
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn bg-dark-100 text-dark-700 hover:bg-dark-200">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        itemName="tagihan"
      />
    </div>
  );
}
