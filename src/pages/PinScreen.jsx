import { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';

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
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-sm flex flex-col items-center gap-8 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-display font-bold">Masukkan PIN</h1>
          <p className="text-sm text-dark-500">Aplikasi RekapKu Anda terkunci</p>
        </div>

        <div className={`flex gap-4 my-4 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                pin.length > i 
                  ? (error ? 'bg-red-500' : 'bg-primary-500') 
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
              className="h-16 rounded-2xl bg-white dark:bg-dark-800 text-2xl font-display font-bold hover:bg-dark-50 dark:hover:bg-dark-700 active:scale-95 transition-all shadow-sm border border-dark-100 dark:border-dark-700"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePress('0')}
            className="h-16 rounded-2xl bg-white dark:bg-dark-800 text-2xl font-display font-bold hover:bg-dark-50 dark:hover:bg-dark-700 active:scale-95 transition-all shadow-sm border border-dark-100 dark:border-dark-700"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-white dark:bg-dark-800 flex items-center justify-center text-dark-500 hover:bg-dark-50 dark:hover:bg-dark-700 active:scale-95 transition-all shadow-sm border border-dark-100 dark:border-dark-700"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
