import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ChartCashFlow from '../components/ChartCashFlow';
import ChartCategory from '../components/ChartCategory';
import { getCategoryById } from '../utils/categories';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { Download } from 'lucide-react';

export default function Reports() {
  const { transactions } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  // Monthly chart data
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === i;
      });
      return {
        name: getMonthName(i).substring(0, 3),
        income: monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions, year]);

  // Category data for pie chart (full year)
  const categoryData = useMemo(() => {
    const spending = {};
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year)
      .forEach(t => { spending[t.categoryId] = (spending[t.categoryId] || 0) + t.amount; });
    return Object.entries(spending)
      .map(([catId, value]) => { const cat = getCategoryById(catId); return { name: cat.name, value, color: cat.color }; })
      .sort((a, b) => b.value - a.value);
  }, [transactions, year]);

  // Yearly totals
  const yearlyTotals = useMemo(() => {
    const yearTxs = transactions.filter(t => new Date(t.date).getFullYear() === year);
    const income = yearTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = yearTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions, year]);

  // Top expenses by category
  const topCategories = categoryData.slice(0, 5);

  const handleExport = () => {
    const yearTxs = transactions.filter(t => new Date(t.date).getFullYear() === year);
    
    // CSV Header
    const headers = ['Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Nominal (Rp)'];
    
    // CSV Rows
    const rows = yearTxs.map(t => {
      const cat = getCategoryById(t.categoryId);
      return [
        t.date,
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        cat ? cat.name : t.categoryId,
        `"${(t.description || '').replace(/"/g, '""')}"`, // Handle commas in description
        t.amount
      ].join(',');
    });
    
    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n'); // Added BOM for Excel UTF-8 support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Keuangan_${year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Laporan</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">Analisis keuanganmu</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center justify-center cursor-pointer btn px-3 py-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40 transition-colors"
            title="Export ke Excel (CSV)"
          >
            <Download className="w-5 h-5 sm:mr-1" />
            <span className="hidden sm:inline text-sm font-medium">Export</span>
          </button>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-dark-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Yearly summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Total Pemasukan</p>
          <p className="font-bold text-lg font-display text-accent-600 dark:text-accent-400">{formatCurrency(yearlyTotals.income)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Total Pengeluaran</p>
          <p className="font-bold text-lg font-display text-rose-500">{formatCurrency(yearlyTotals.expense)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-xs text-dark-500 dark:text-dark-400 mb-1">Net</p>
          <p className={`font-bold text-lg font-display ${yearlyTotals.balance >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500'}`}>
            {formatCurrency(yearlyTotals.balance)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <ChartCashFlow data={monthlyData} />

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCategory data={categoryData} />

        {/* Top categories table */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-display font-semibold text-base mb-4">Top Pengeluaran</h3>
          {topCategories.length === 0 ? (
            <p className="text-sm text-dark-400 text-center py-8">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat, i) => {
                const totalExp = categoryData.reduce((s, c) => s + c.value, 0);
                const pct = totalExp > 0 ? ((cat.value / totalExp) * 100).toFixed(1) : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-dark-400 w-5">{i + 1}</span>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 text-sm truncate">{cat.name}</span>
                    <span className="text-sm font-semibold">{formatCurrency(cat.value)}</span>
                    <span className="text-xs text-dark-400 w-12 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
