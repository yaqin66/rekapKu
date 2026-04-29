import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { Plus, Edit2, Trash2, Target, PlusCircle } from 'lucide-react';
import Modal from '../components/Modal';

export default function Goals() {
  const { goals, dispatch } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpGoal, setTopUpGoal] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    color: '#3b82f6',
    icon: 'Target'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
    };
    
    if (editingGoal) {
      await dispatch({ type: 'UPDATE_GOAL', payload: { ...data, id: editingGoal.id } });
    } else {
      await dispatch({ type: 'ADD_GOAL', payload: data });
    }
    
    setIsModalOpen(false);
    setEditingGoal(null);
    setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#3b82f6', icon: 'Target' });
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      color: goal.color,
      icon: goal.icon
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus tujuan ini?')) {
      await dispatch({ type: 'DELETE_GOAL', payload: id });
    }
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    if (!topUpGoal) return;
    
    const newAmount = topUpGoal.currentAmount + parseFloat(topUpAmount);
    await dispatch({ 
      type: 'UPDATE_GOAL', 
      payload: { ...topUpGoal, currentAmount: newAmount } 
    });
    
    setIsTopUpModalOpen(false);
    setTopUpGoal(null);
    setTopUpAmount('');
  };
  
  const openTopUp = (goal) => {
    setTopUpGoal(goal);
    setTopUpAmount('');
    setIsTopUpModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Tujuan Keuangan</h1>
          <p className="text-dark-500 dark:text-dark-400">Pantau progres tabungan atau target keuangan Anda.</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#3b82f6', icon: 'Target' });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center cursor-pointer btn btn-primary w-60 h-15 px-3 py-1 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Tujuan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <div key={goal.id} className="card p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: goal.color }}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{goal.name}</h3>
                    <p className="text-sm text-dark-500">Target: {goal.deadline}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(goal)} className="p-1 text-dark-400 hover:text-primary-500 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(goal.id)} className="p-1 text-dark-400 hover:text-danger-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-dark-700 dark:text-dark-300">Terkumpul: {formatCurrency(goal.currentAmount)}</span>
                  <span className="text-dark-500">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="h-2 w-full bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: goal.color }}
                  />
                </div>
                <div className="text-right text-xs text-dark-500 mt-1 mb-4">
                  {progress.toFixed(1)}%
                </div>
                <button 
                  onClick={() => openTopUp(goal)}
                  className="flex items-center justify-center cursor-pointer w-full p-5 rounded-2xl btn btn-sm bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40"
                >
                  <PlusCircle className="w-4 h-4 mr-1" /> Tambah Dana
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 text-dark-400">
          Belum ada tujuan keuangan yang dicatat.
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? "Edit Tujuan" : "Tambah Tujuan Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Tujuan</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Beli Laptop Baru"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Nominal (Rp)</label>
            <input
              type="number"
              required
              min="0"
              className="input w-full"
              value={formData.targetAmount}
              onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Terkumpul Saat Ini (Rp)</label>
            <input
              type="number"
              min="0"
              className="input w-full"
              value={formData.currentAmount}
              onChange={e => setFormData({ ...formData, currentAmount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tenggat Waktu / Deadline</label>
            <input
              type="date"
              required
              className="input w-full"
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="cursor-pointer btn px-3 py-1 rounded-lg bg-dark-100 text-dark-700 hover:bg-dark-200">
              Batal
            </button>
            <button type="submit" className="cursor-pointer btn px-3 py-1 rounded-lg btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      {/* Top Up Modal */}
      <Modal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        title="Tambah Dana Tujuan"
      >
        <form onSubmit={handleTopUpSubmit} className="space-y-4">
          <div className="p-3 bg-dark-50 dark:bg-dark-900 rounded-lg mb-4">
            <p className="text-sm text-dark-500">Tujuan: <span className="font-semibold text-dark-900 dark:text-dark-100">{topUpGoal?.name}</span></p>
            <p className="text-sm text-dark-500">Terkumpul saat ini: <span className="font-semibold text-primary-500">{formatCurrency(topUpGoal?.currentAmount || 0)}</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nominal yang ditambahkan (Rp)</label>
            <input
              type="number"
              required
              min="1"
              className="input w-full"
              value={topUpAmount}
              onChange={e => setTopUpAmount(e.target.value)}
              placeholder="Contoh: 500000"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsTopUpModalOpen(false)} className="cursor-pointer btn px-3 py-1 rounded-lg bg-dark-100 text-dark-700 hover:bg-dark-200">
              Batal
            </button>
            <button type="submit" className="cursor-pointer btn btn-primary">
              Tambahkan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
