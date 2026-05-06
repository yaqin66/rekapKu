import { Moon, Sun, Menu, Lock, Sparkles, Eye, EyeOff, Settings, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getCurrentMonthYear } from '../utils/formatters';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const { user, logout } = useAuth();
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef();
  const hasPin = !!localStorage.getItem('app_pin');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {user && (
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
        )}

        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="cursor-pointer flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ml-1"
              title="Profil"
            >
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
              )}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in origin-top-right">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
                
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Settings className="w-4 h-4" /> Pengaturan
                </Link>
                
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showSecurityModal} onClose={() => setShowSecurityModal(false)} title="Pengaturan Keamanan">
        <SecurityForm onClose={() => setShowSecurityModal(false)} hasPin={hasPin} />
      </Modal>

      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="Keluar Akun">
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-2">
              <LogOut className="w-8 h-8 text-red-500 dark:text-red-400 ml-1" />
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Apakah Anda yakin ingin keluar dari aplikasi? Anda harus masuk kembali untuk mengelola keuangan Anda.
            </p>
          </div>
          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
            >
              Batal
            </button>
            <button
              onClick={() => {
                setShowLogoutConfirm(false);
                logout();
              }}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 active:scale-[0.98]"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
