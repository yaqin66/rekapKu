import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Wallets from './pages/Wallets';
import Reports from './pages/Reports';
import Bills from './pages/Bills';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import PinScreen from './pages/PinScreen';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    const pin = localStorage.getItem('app_pin');
    if (pin) {
      setHasPin(true);
    } else {
      setIsUnlocked(true);
    }
    
    // Listen for custom event when PIN is changed from Header
    const handlePinUpdate = () => {
      const newPin = localStorage.getItem('app_pin');
      setHasPin(!!newPin);
    };
    window.addEventListener('pin_updated', handlePinUpdate);
    
    // Listen for custom lock event
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

  if (hasPin && !isUnlocked) {
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
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/debts" element={<Debts />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
