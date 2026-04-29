import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SummaryCard({ title, amount, icon: Icon, gradient, trend, trendLabel }) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;

  return (
    <div className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${gradient} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isNeutral ? 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400' :
            isPositive
              ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
              : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
            {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">{title}</p>
      <p className="text-base sm:text-lg xl:text-xl font-bold font-display tracking-tight truncate">{amount}</p>
      {trendLabel && (
        <p className="text-xs text-dark-400 dark:text-dark-500 mt-1">{trendLabel}</p>
      )}
    </div>
  );
}
