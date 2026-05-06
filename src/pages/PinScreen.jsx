import { useState, useEffect } from 'react';
import { Lock, Delete, Wallet } from 'lucide-react';

export default function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = localStorage.getItem('app_pin');

  const handlePress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  }, [pin, correctPin, onUnlock]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-dark-950 dark:via-dark-900 dark:to-primary-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl gradient-primary text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Masukkan PIN</h1>
          <p className="text-sm text-dark-500">Aplikasi RekapKu Anda terkunci</p>
        </div>

        <div className={`flex gap-4 my-4 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > i 
                  ? (error ? 'bg-danger-500 scale-110' : 'bg-primary-500 scale-110') 
                  : 'bg-dark-200 dark:bg-dark-700'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full px-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="h-16 rounded-2xl bg-white/80 dark:bg-dark-800 text-2xl font-display font-bold hover:bg-primary-50 dark:hover:bg-dark-700 active:scale-95 transition-all shadow-sm border border-primary-100 dark:border-dark-700 backdrop-blur-sm"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePress('0')}
            className="h-16 rounded-2xl bg-white/80 dark:bg-dark-800 text-2xl font-display font-bold hover:bg-primary-50 dark:hover:bg-dark-700 active:scale-95 transition-all shadow-sm border border-primary-100 dark:border-dark-700 backdrop-blur-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-white/80 dark:bg-dark-800 flex items-center justify-center text-dark-500 hover:bg-primary-50 dark:hover:bg-dark-700 active:scale-95 transition-all shadow-sm border border-primary-100 dark:border-dark-700 backdrop-blur-sm"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
