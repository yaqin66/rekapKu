import { useState, useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SummaryCard from '../components/SummaryCard';
import ChartCashFlow from '../components/ChartCashFlow';
import ChartCategory from '../components/ChartCategory';
import TransactionList from '../components/TransactionList';
import BudgetCard from '../components/BudgetCard';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { formatCurrency, getMonthName } from '../utils/formatters';
import { getCategoryById, EXPENSE_CATEGORIES } from '../utils/categories';

export default function Dashboard() {
  const { transactions, wallets, budgets, getMonthlyStats, getTotalBalance, getCategorySpending, isBalanceHidden, toggleBalance } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const stats = useMemo(() => getMonthlyStats(currentYear, currentMonth), [getMonthlyStats, currentYear, currentMonth]);
  const prevStats = useMemo(() => getMonthlyStats(currentYear, currentMonth - 1), [getMonthlyStats, currentYear, currentMonth]);

  const incomeTrend = prevStats.income > 0 ? (((stats.income - prevStats.income) / prevStats.income) * 100).toFixed(1) : 0;
  const expenseTrend = prevStats.expense > 0 ? (((stats.expense - prevStats.expense) / prevStats.expense) * 100).toFixed(1) : 0;

  // Weekly cash flow data for chart
  const weeklyData = useMemo(() => {
    const weeks = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    for (let w = 0; w < 4; w++) {
      const weekStart = new Date(firstDay);
      weekStart.setDate(firstDay.getDate() + w * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      if (weekEnd > lastDay) weekEnd.setTime(lastDay.getTime());

      const weekTxs = stats.transactions.filter(t => {
        const d = new Date(t.date);
        return d >= weekStart && d <= weekEnd;
      });

      weeks.push({
        name: `Minggu ${w + 1}`,
        income: weekTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: weekTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return weeks;
  }, [stats, currentYear, currentMonth]);

  // Category spending data for pie chart
  const categoryData = useMemo(() => {
    const spending = {};
    stats.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        spending[t.categoryId] = (spending[t.categoryId] || 0) + t.amount;
      });

    return Object.entries(spending)
      .map(([catId, value]) => {
        const cat = getCategoryById(catId);
        return { name: cat.name, value, color: cat.color };
      })
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-0.5">
            Ringkasan keuanganmu bulan {getMonthName(currentMonth)}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 active:scale-95"
          id="add-transaction-btn"
        >
          <Plus className="w-6 h-6" />
          <span className="cursor-pointer hidden sm:inline">Tambah Transaksi</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 stagger-children">
        <SummaryCard
          title="Total Saldo"
          amount={formatCurrency(getTotalBalance())}
          icon={Wallet}
          gradient="gradient-primary"
          isHidden={isBalanceHidden}
          onToggleHidden={toggleBalance}
        />
        <SummaryCard
          title="Pemasukan"
          amount={formatCurrency(stats.income)}
          icon={TrendingUp}
          gradient="gradient-accent"
          trend={parseFloat(incomeTrend)}
          trendLabel="vs bulan lalu"
          isHidden={isBalanceHidden}
        />
        <SummaryCard
          title="Pengeluaran"
          amount={formatCurrency(stats.expense)}
          icon={TrendingDown}
          gradient="gradient-danger"
          trend={parseFloat(expenseTrend) * -1}
          trendLabel="vs bulan lalu"
          isHidden={isBalanceHidden}
        />
        <SummaryCard
          title="Sisa Bulan Ini"
          amount={formatCurrency(stats.balance)}
          icon={PiggyBank}
          gradient="gradient-purple"
          isHidden={isBalanceHidden}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="lg:col-span-3">
          <ChartCashFlow data={weeklyData} />
        </div>
        <div className="lg:col-span-2">
          <ChartCategory data={categoryData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Recent Transactions */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Transaksi Terbaru</h3>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <TransactionList transactions={recentTransactions} />
        </div>

        {/* Budget Overview */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Anggaran Bulan Ini</h3>
            <Link
              to="/budget"
              className="flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              Kelola <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {budgets.length === 0 ? (
            <div className="text-center py-8">
              <PiggyBank className="w-10 h-10 mx-auto text-primary-200 dark:text-dark-600 mb-2" />
              <p className="text-sm text-dark-400 dark:text-dark-500">Belum ada anggaran</p>
              <Link to="/budget" className="text-xs text-primary-500 hover:underline mt-1 inline-block">Buat anggaran</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.slice(0, 4).map(budget => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  spent={getCategorySpending(budget.categoryId, currentYear, currentMonth)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Transaksi">
        <TransactionForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
}
