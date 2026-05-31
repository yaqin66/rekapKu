import { formatCurrency } from '../utils/formatters';
import { WALLET_ICONS } from '../utils/categories';
import { Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WalletCard({ wallet, onEdit, onDelete }) {
  const { isBalanceHidden } = useApp();
  const IconComponent = WALLET_ICONS[wallet.icon] || WALLET_ICONS.Wallet;
  const isNegative = wallet.balance < 0;

  return (
    <div className="glass-card rounded-2xl p-5 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-8 translate-x-8"
        style={{ backgroundColor: wallet.color }}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
            style={{ backgroundColor: wallet.color }}
          >
            <IconComponent className="w-6 h-6 text-white" />
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(wallet)}
              className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400 hover:text-primary-500 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(wallet.id)}
              className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">{wallet.name}</p>
        <p className={`text-2xl font-bold font-display ${
          isNegative ? 'text-red-500' : ''
        }`}>
          {isBalanceHidden ? 'Rp •••••••' : formatCurrency(wallet.balance)}
        </p>
      </div>
    </div>
  );
}
