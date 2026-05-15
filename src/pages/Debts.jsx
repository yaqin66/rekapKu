import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { Plus, Edit2, Trash2, Handshake } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function Debts() {
  const { debts, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const [deleteId, setDeleteId] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'debt',
    name: '',
    amount: '',
    remainingAmount: '',
    dueDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      remainingAmount: formData.remainingAmount !== '' ? parseFloat(formData.remainingAmount) : parseFloat(formData.amount)
    };
    
    if (editingDebt) {
      await dispatch({ type: 'UPDATE_DEBT', payload: { ...data, id: editingDebt.id } });
    } else {
      await dispatch({ type: 'ADD_DEBT', payload: data });
    }
    
    setIsModalOpen(false);
    setEditingDebt(null);
    setFormData({ type: 'debt', name: '', amount: '', remainingAmount: '', dueDate: '' });
  };

  const openEdit = (debt) => {
    setEditingDebt(debt);
    setFormData({
      type: debt.type,
      name: debt.name,
      amount: debt.amount,
      remainingAmount: debt.remainingAmount,
      dueDate: debt.dueDate || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch({ type: 'DELETE_DEBT', payload: deleteId });
      setDeleteId(null);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentDebt) return;
    
    const amountToPay = parseFloat(paymentAmount);
    if (isNaN(amountToPay) || amountToPay <= 0) return;

    const newRemainingAmount = Math.max(0, paymentDebt.remainingAmount - amountToPay);
    
    await dispatch({ 
      type: 'UPDATE_DEBT', 
      payload: { ...paymentDebt, remainingAmount: newRemainingAmount } 
    });
    
    setIsPaymentModalOpen(false);
    setPaymentDebt(null);
    setPaymentAmount('');
  };
  
  const openPayment = (debt) => {
    setPaymentDebt(debt);
    setPaymentAmount('');
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Utang & Piutang</h1>
          <p className="text-dark-500 dark:text-dark-400">Catat siapa yang berutang atau piutang Anda.</p>
        </div>
        <button
          onClick={() => {
            setEditingDebt(null);
            setFormData({ type: 'debt', name: '', amount: '', remainingAmount: '', dueDate: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center cursor-pointer btn btn-primary w-60 h-15 px-3 py-1 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Catatan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debts.map(debt => {
          const isDebt = debt.type === 'debt'; // Utang (Saya berutang ke orang lain)
          const isPaidOff = debt.remainingAmount <= 0;
          
          return (
            <div key={debt.id} className={`card p-6 flex flex-col border-l-4 ${isDebt ? 'border-l-danger-500' : 'border-l-success-500'} ${isPaidOff ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${isDebt ? 'bg-danger-500' : 'bg-success-500'}`}>
                    <Handshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{debt.name}</h3>
                    <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${isDebt ? 'bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300' : 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300'}`}>
                      {isDebt ? 'Saya Berutang' : 'Piutang (Orang Berutang)'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Total Nominal:</span>
                  <span className="font-medium text-dark-900 dark:text-dark-100">{formatCurrency(debt.amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-dark-700 dark:text-dark-300">Sisa Dibayar:</span>
                  <span className={isDebt ? 'text-danger-500' : 'text-success-500'}>{formatCurrency(debt.remainingAmount)}</span>
                </div>
                {debt.dueDate && (
                  <div className="text-xs text-dark-500 text-right pt-2 border-t border-dark-100 dark:border-dark-700 mt-2">
                    Jatuh Tempo: {debt.dueDate}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-dark-100 dark:border-dark-700 flex gap-2 justify-end">
                {!isPaidOff && (
                  <button onClick={() => openPayment(debt)} className="btn btn-sm bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-900/50">
                    Bayar
                  </button>
                )}
                <button onClick={() => openEdit(debt)} className="btn btn-sm bg-dark-100 text-dark-700 hover:bg-dark-200">
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </button>
                <button onClick={() => setDeleteId(debt.id)} className="btn btn-sm bg-danger-50 text-danger-600 hover:bg-danger-100 dark:bg-danger-900/30 dark:hover:bg-danger-900/50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {debts.length === 0 && (
        <div className="text-center py-12 text-dark-400">
          Belum ada utang atau piutang yang dicatat.
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDebt ? "Edit Catatan" : "Tambah Catatan"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Catatan</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="debt"
                  checked={formData.type === 'debt'}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-dark-300"
                />
                <span className="text-sm">Saya Berutang</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="receivable"
                  checked={formData.type === 'receivable'}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-dark-300"
                />
                <span className="text-sm">Diutangi (Piutang)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nama Pihak/Catatan</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder={formData.type === 'debt' ? "Contoh: Pinjam ke Budi" : "Contoh: Budi pinjam"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Nominal</label>
            <input
              type="number"
              required
              min="0"
              className="input w-full"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          {editingDebt && (
            <div>
              <label className="block text-sm font-medium mb-1">Sisa Dibayar</label>
              <input
                type="number"
                min="0"
                className="input w-full"
                value={formData.remainingAmount}
                onChange={e => setFormData({ ...formData, remainingAmount: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Jatuh Tempo (Opsional)</label>
            <input
              type="date"
              className="input w-full"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            />
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

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pembayaran Utang/Piutang"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="p-3 bg-dark-50 dark:bg-dark-900 rounded-lg mb-4">
            <p className="text-sm text-dark-500">Nama: <span className="font-semibold text-dark-900 dark:text-dark-100">{paymentDebt?.name}</span></p>
            <p className="text-sm text-dark-500">Sisa Dibayar: <span className="font-semibold text-primary-500">{formatCurrency(paymentDebt?.remainingAmount || 0)}</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nominal Pembayaran (Rp)</label>
            <input
              type="number"
              required
              min="1"
              max={paymentDebt?.remainingAmount}
              className="input w-full"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              placeholder="Contoh: 500000"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="cursor-pointer btn px-3 py-1 rounded-lg bg-dark-100 text-dark-700 hover:bg-dark-200">
              Batal
            </button>
            <button type="submit" className="cursor-pointer btn btn-primary">
              Bayar
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        itemName="catatan utang/piutang"
      />
    </div>
  );
}
