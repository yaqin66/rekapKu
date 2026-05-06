import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Wallets from './pages/Wallets';
import Reports from './pages/Reports';
import Bills from './pages/Bills';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import Calendar from './pages/Calendar';
import PinScreen from './pages/PinScreen';
import Settings from './pages/Settings';

// Komponen Pelindung (Mengarahkan user ke /login jika belum login)
function ProtectedRoute({ children }) {
  const { user, isAuthLoading } = useAuth();
  
  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500">Memuat...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const { user } = useAuth(); // Gunakan user untuk mencegah PinScreen muncul sebelum login

  useEffect(() => {
    const pin = localStorage.getItem('app_pin');
    if (pin) {
      setHasPin(true);
    } else {
      setIsUnlocked(true);
    }
    
    const handlePinUpdate = () => {
      const newPin = localStorage.getItem('app_pin');
      setHasPin(!!newPin);
    };
    window.addEventListener('pin_updated', handlePinUpdate);
    
    const handleLock = () => {
      if (localStorage.getItem('app_pin')) {
        setIsUnlocked(false);
      }
    };
    window.addEventListener('app_lock', handleLock);

    return () => {
      window.removeEventListener('pin_updated', handlePinUpdate);
      window.removeEventListener('app_lock', handleLock);
    };
  }, []);

  if (user && hasPin && !isUnlocked) {
    return (
      <ThemeProvider>
        <PinScreen onUnlock={() => setIsUnlocked(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Semua halaman utama dibungkus ProtectedRoute */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/debts" element={<Debts />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
