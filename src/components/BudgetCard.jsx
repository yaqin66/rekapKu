import { getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

export default function BudgetCard({ budget, spent, onEdit, onDelete }) {
  const cat = getCategoryById(budget.categoryId);
  const Icon = cat.icon;
  const percentage = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0;
  const remaining = budget.limit - spent;
  const isOverBudget = spent > budget.limit;
  const isNearLimit = percentage >= 80 && !isOverBudget;

  return (
    <div className="glass-card rounded-2xl p-4 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: cat.color + '18' }}
          >
            <Icon className="w-5 h-5" style={{ color: cat.color }} />
          </div>
          <div>
            <p className="font-medium text-sm">{cat.name}</p>
            <p className="text-xs text-dark-400 dark:text-dark-500">
              {formatCurrency(spent)} / {formatCurrency(budget.limit)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isOverBudget && (
            <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
              Melebihi!
            </span>
          )}
          {isNearLimit && (
            <span className="text-xs font-medium text-warning-500 bg-yellow-50 dark:bg-yellow-500/10 px-2 py-0.5 rounded-full">
              Hampir Habis
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-dark-100 dark:bg-dark-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: isOverBudget ? '#ef4444' : isNearLimit ? '#f59e0b' : cat.color,
          }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span className={`text-xs font-medium ${
          isOverBudget ? 'text-red-500' : 'text-dark-400 dark:text-dark-500'
        }`}>
          {remaining >= 0 ? `Sisa ${formatCurrency(remaining)}` : `Lebih ${formatCurrency(Math.abs(remaining))}`}
        </span>
        <span className="text-xs text-dark-400 dark:text-dark-500">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
