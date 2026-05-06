import { Moon, Sun, Menu, Lock, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { formatCurrency, getCurrentMonthYear } from '../utils/formatters';
import { useState } from 'react';
import Modal from './Modal';

function SecurityForm({ onClose, hasPin }) {
  const [pin, setPin] = useState('');
  
  const handleSetPin = (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      alert('PIN harus 4 digit angka');
      return;
    }
    localStorage.setItem('app_pin', pin);
    window.dispatchEvent(new Event('pin_updated'));
    alert('PIN berhasil dipasang!');
    onClose();
  };

  const handleRemovePin = (e) => {
    e.preventDefault();
    const currentPin = localStorage.getItem('app_pin');
    if (pin === currentPin) {
      localStorage.removeItem('app_pin');
      window.dispatchEvent(new Event('pin_updated'));
      alert('PIN berhasil dihapus!');
      onClose();
    } else {
      alert('PIN salah!');
    }
  };

  const handleLockNow = () => {
    window.dispatchEvent(new Event('app_lock'));
    onClose();
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-center tracking-[1em] font-bold text-lg";

  return (
    <div className="space-y-6">
      {!hasPin ? (
        <form onSubmit={handleSetPin} className="space-y-4">
          <p className="text-sm text-dark-500">Buat 4 digit PIN untuk mengunci aplikasi Anda.</p>
          <input 
            type="password" 
            maxLength="4" 
            value={pin} 
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))} 
            className={inputClass} 
            placeholder="••••"
            required
          />
          <button type="submit" className="cursor-pointer w-full py-3 rounded-xl font-semibold text-white gradient-primary hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-[0.98]">
            Pasang PIN
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <button onClick={handleLockNow} className="cursor-pointer flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-dark-800 dark:text-primary-400 dark:hover:bg-dark-700 transition-all">
            <Lock className="w-4 h-4" /> Kunci Aplikasi Sekarang
          </button>
          
          <hr className="border-primary-100 dark:border-dark-700 my-4" />
          
          <form onSubmit={handleRemovePin} className="space-y-4">
            <p className="text-sm text-dark-500">Masukkan PIN saat ini untuk menghapus fitur kunci.</p>
            <input 
              type="password" 
              maxLength="4" 
              value={pin} 
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))} 
              className={inputClass} 
              placeholder="••••"
              required
            />
            <button type="submit" className="cursor-pointer w-full py-3 rounded-xl font-semibold text-white gradient-danger hover:shadow-lg hover:shadow-danger-500/25 transition-all active:scale-[0.98]">
              Hapus PIN
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Header({ onMenuClick }) {
  const { isDark, toggleTheme } = useTheme();
  const { getTotalBalance, isBalanceHidden, toggleBalance } = useApp();
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const hasPin = !!localStorage.getItem('app_pin');

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-primary-100/60 dark:border-dark-700">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-800 transition-colors lg:hidden"
          id="menu-toggle"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-medium text-dark-600 dark:text-dark-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            {getCurrentMonthYear()}
          </h2>
          <div className="text-xs text-dark-400 dark:text-dark-500 hidden sm:flex items-center gap-1.5 mt-0.5">
            Total Saldo: <span className="font-semibold text-primary-600 dark:text-primary-400">
              {isBalanceHidden ? 'Rp •••••••' : formatCurrency(getTotalBalance())}
            </span>
            <button onClick={toggleBalance} className="cursor-pointer text-dark-400 hover:text-primary-500 hover:scale-110 transition-colors focus:outline-none" title="Sembunyikan/Tampilkan Saldo">
              {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSecurityModal(true)}
          className="cursor-pointer p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-800 transition-all duration-200 group"
          title="Keamanan"
        >
          <Lock className="w-5 h-5 text-dark-400 dark:text-dark-400 group-hover:text-primary-500 transition-colors" />
        </button>

        <button
          onClick={toggleTheme}
          className="cursor-pointer p-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-dark-800 transition-all duration-200 group"
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-warning-400 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-primary-400 group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      <Modal isOpen={showSecurityModal} onClose={() => setShowSecurityModal(false)} title="Pengaturan Keamanan">
        <SecurityForm onClose={() => setShowSecurityModal(false)} hasPin={hasPin} />
      </Modal>
    </header>
  );
}
