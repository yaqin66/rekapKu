import { TrendingUp, TrendingDown, Minus, Eye, EyeOff } from 'lucide-react';

export default function SummaryCard({ title, amount, icon: Icon, gradient, trend, trendLabel, isHidden, onToggleHidden }) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;

  return (
    <div className="glass-card rounded-2xl p-5 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${gradient} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isNeutral ? 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400' :
            isPositive
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}>
            {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-dark-500 dark:text-dark-400">{title}</p>
        {onToggleHidden && (
          <button onClick={onToggleHidden} className="cursor-pointer hover:scale-110 text-dark-400 hover:text-primary-500 transition-colors focus:outline-none">
            {isHidden ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
          </button>
        )}
      </div>
      <p className="text-base sm:text-lg xl:text-xl font-bold font-display tracking-tight truncate">
        {isHidden ? 'Rp •••••••' : amount}
      </p>
      {trendLabel && (
        <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">{trendLabel}</p>
      )}
    </div>
  );
}
