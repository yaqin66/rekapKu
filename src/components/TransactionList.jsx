import { Pencil, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { getCategoryById } from '../utils/categories';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center">
          <ArrowLeftRight className="w-8 h-8 text-dark-300 dark:text-dark-600" />
        </div>
        <p className="text-dark-400 dark:text-dark-500 font-medium">Belum ada transaksi</p>
        <p className="text-sm text-dark-300 dark:text-dark-600 mt-1">Mulai catat pengeluaran & pemasukanmu</p>
      </div>
    );
  }

  // Group by date
  const grouped = transactions.reduce((acc, tx) => {
    const dateKey = tx.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="space-y-4">
      {sortedDates.map(date => (
        <div key={date}>
          <h4 className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase tracking-wider mb-2 px-1">
            {formatDate(date)}
          </h4>
          <div className="space-y-2">
            {grouped[date].map(tx => {
              const cat = getCategoryById(tx.categoryId);
              const Icon = cat.icon;
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="glass-card rounded-xl p-3.5 flex items-center gap-3 group hover:shadow-md transition-all duration-200"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cat.color + '18' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{cat.name}</p>
                    {tx.description && (
                      <p className="text-xs text-dark-400 dark:text-dark-500 truncate">{tx.description}</p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`font-semibold text-sm ${
                      isIncome ? 'text-primary-600 dark:text-primary-400' : 'text-red-500 dark:text-red-400'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>

                  {onEdit && onDelete && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400 hover:text-primary-500 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(tx.id)}
                        className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 text-dark-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ArrowLeftRight(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>
    </svg>
  );
}
