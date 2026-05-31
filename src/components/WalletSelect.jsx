import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Wallet as DefaultWalletIcon } from 'lucide-react';
import { WALLET_ICONS } from '../utils/categories';

export default function WalletSelect({ wallets, value, onChange, className, showBalance = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedWallet = wallets.find(w => w.id === value);
  const SelectedIcon = selectedWallet && WALLET_ICONS[selectedWallet.icon] ? WALLET_ICONS[selectedWallet.icon] : DefaultWalletIcon;

  return (
    <div className="relative w-full" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between w-full text-left`}
      >
        <div className="flex items-center gap-2">
          {selectedWallet ? (
            <>
              <div 
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: selectedWallet.color + '20' }}
              >
                <SelectedIcon className="w-3.5 h-3.5" style={{ color: selectedWallet.color }} />
              </div>
              <span className="text-dark-900 dark:text-dark-100 font-medium">
                {selectedWallet.name} {showBalance && `(Rp ${selectedWallet.balance.toLocaleString('id-ID')})`}
              </span>
            </>
          ) : (
            <span className="text-dark-500">Pilih dompet</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 py-2 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-dark-100 dark:border-dark-700 w-full max-h-60 overflow-y-auto animate-fadeIn scrollbar-thin">
          {wallets.length === 0 ? (
            <div className="px-4 py-3 text-sm text-dark-500 text-center">Belum ada dompet</div>
          ) : (
            wallets.map(w => {
              const Icon = WALLET_ICONS[w.icon] || DefaultWalletIcon;
              const isSelected = w.id === value;
              
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    onChange(w.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-dark-50 dark:hover:bg-dark-700
                    ${isSelected ? 'bg-primary-50 dark:bg-primary-500/10' : ''}
                  `}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: w.color + '20' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: w.color }} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`text-sm font-medium ${isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-dark-700 dark:text-dark-200'}`}>
                      {w.name} {showBalance && `(Rp ${w.balance.toLocaleString('id-ID')})`}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
