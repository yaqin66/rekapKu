import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getMonthName } from '../utils/formatters';

export default function Calendar() {
  const { transactions, bills, isBalanceHidden } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Calendar logic
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const days = [];
  // Empty slots before the first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  // Aggregate data for each day
  const dayDataMap = useMemo(() => {
    const map = {};
    
    // Process transactions
    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dateKey = d.getDate();
        if (!map[dateKey]) map[dateKey] = { income: 0, expense: 0, bills: [] };
        if (t.type === 'income') map[dateKey].income += t.amount;
        if (t.type === 'expense') map[dateKey].expense += t.amount;
      }
    });

    // Process bills
    bills.forEach(b => {
      const d = new Date(b.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const dateKey = d.getDate();
        if (!map[dateKey]) map[dateKey] = { income: 0, expense: 0, bills: [] };
        map[dateKey].bills.push(b);
      }
    });

    return map;
  }, [transactions, bills, year, month]);

  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary-500" /> Kalender Keuangan
          </h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
            Pantau arus kas harian dan jadwal tagihan Anda
          </p>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button onClick={handleToday} className="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 px-3 py-2 rounded-xl transition-colors">
            Hari Ini
          </button>
          <div className="flex items-center gap-2 bg-white dark:bg-dark-800 px-2 py-1.5 rounded-xl shadow-sm border border-primary-100 dark:border-dark-700">
            <button onClick={handlePrevMonth} className="cursor-pointer p-1.5 hover:bg-primary-50 dark:hover:bg-dark-700 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-dark-500" />
            </button>
            <span className="font-semibold min-w-[130px] text-center">
              {getMonthName(month)} {year}
            </span>
            <button onClick={handleNextMonth} className="cursor-pointer p-1.5 hover:bg-primary-50 dark:hover:bg-dark-700 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-dark-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-primary-100 dark:border-dark-700">
        <div className="grid grid-cols-7 bg-primary-50 dark:bg-dark-800 border-b border-primary-100 dark:border-dark-700">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-sm font-bold text-dark-600 dark:text-dark-300">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-[110px] md:auto-rows-[130px] divide-x divide-y divide-primary-100 dark:divide-dark-700/50 bg-white dark:bg-dark-900">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="bg-dark-50/50 dark:bg-dark-800/20" />;
            }
            
            const dayNum = date.getDate();
            const data = dayDataMap[dayNum];
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div key={dayNum} className={`p-1.5 md:p-2 transition-colors hover:bg-primary-50/30 dark:hover:bg-dark-800/30 relative flex flex-col gap-1 overflow-y-auto ${isToday ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                <div className="flex justify-end mb-1">
                  <span className={`text-xs sm:text-sm font-semibold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary-500 text-white shadow-md' : 'text-dark-600 dark:text-dark-300'}`}>
                    {dayNum}
                  </span>
                </div>
                
                {data?.income > 0 && (
                  <div className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1 sm:px-1.5 py-0.5 rounded flex justify-between items-center" title={`Pemasukan: ${formatCurrency(data.income)}`}>
                    <span className="hidden sm:inline">+</span>
                    <span className="truncate">{isBalanceHidden ? '•••' : formatCurrency(data.income)}</span>
                  </div>
                )}
                
                {data?.expense > 0 && (
                  <div className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1 sm:px-1.5 py-0.5 rounded flex justify-between items-center" title={`Pengeluaran: ${formatCurrency(data.expense)}`}>
                    <span className="hidden sm:inline">-</span>
                    <span className="truncate">{isBalanceHidden ? '•••' : formatCurrency(data.expense)}</span>
                  </div>
                )}

                {data?.bills?.map(bill => (
                  <div key={bill.id} className={`text-[9px] sm:text-[10px] md:text-xs font-medium px-1 sm:px-1.5 py-0.5 rounded flex flex-col sm:flex-row sm:justify-between items-start sm:items-center border ${bill.isPaid ? 'border-emerald-200 text-emerald-600 bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10' : 'border-warning-200 text-warning-700 bg-warning-50 dark:border-warning-500/20 dark:text-warning-400 dark:bg-warning-500/10'}`} title={`Tagihan: ${bill.name} (${formatCurrency(bill.amount)})`}>
                    <span className="truncate flex items-center gap-1 w-full">
                      {bill.isPaid ? <CheckCircle2 className="w-2.5 h-2.5 flex-shrink-0 hidden sm:block" /> : <CalendarIcon className="w-2.5 h-2.5 flex-shrink-0 hidden sm:block" />}
                      <span className="truncate">{bill.name}</span>
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend / Info */}
      <div className="flex flex-wrap gap-4 text-xs font-medium text-dark-500 dark:text-dark-400 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500"></div> Pemasukan
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-rose-500"></div> Pengeluaran
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-warning-500"></div> Tagihan Menunggu
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-emerald-500/50 bg-emerald-500/10"></div> Tagihan Lunas
        </div>
      </div>
    </div>
  );
}
