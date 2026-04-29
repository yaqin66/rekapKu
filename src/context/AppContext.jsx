import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import { generateId } from '../utils/formatters';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [bills, setBills] = useState([]);
  const [goals, setGoals] = useState([]);
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from API on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [txsData, walletsData, budgetsData, billsData, goalsData, debtsData] = await Promise.all([
          apiGet('/transactions'),
          apiGet('/wallets'),
          apiGet('/budgets'),
          apiGet('/bills'),
          apiGet('/goals'),
          apiGet('/debts'),
        ]);
        setTransactions(txsData);
        setWallets(walletsData);
        setBudgets(budgetsData);
        setBills(billsData);
        setGoals(goalsData);
        setDebts(debtsData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load data from backend:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Async actions wrapping API calls

  const dispatch = async (action) => {
    try {
      switch (action.type) {
        case 'ADD_TRANSACTION': {
          const newTx = { ...action.payload, id: generateId() };
          const result = await apiPost('/transactions', newTx);
          // Refetch to sync wallets balance as it was updated in backend
          const [updatedTxs, updatedWallets] = await Promise.all([
            apiGet('/transactions'),
            apiGet('/wallets')
          ]);
          setTransactions(updatedTxs);
          setWallets(updatedWallets);
          break;
        }
        case 'UPDATE_TRANSACTION': {
          await apiPut(`/transactions/${action.payload.id}`, action.payload);
          const [updatedTxs, updatedWallets] = await Promise.all([
            apiGet('/transactions'),
            apiGet('/wallets')
          ]);
          setTransactions(updatedTxs);
          setWallets(updatedWallets);
          break;
        }
        case 'DELETE_TRANSACTION': {
          await apiDelete(`/transactions/${action.payload}`);
          const [updatedTxs, updatedWallets] = await Promise.all([
            apiGet('/transactions'),
            apiGet('/wallets')
          ]);
          setTransactions(updatedTxs);
          setWallets(updatedWallets);
          break;
        }
        case 'ADD_WALLET': {
          const newWallet = { ...action.payload, id: generateId() };
          const result = await apiPost('/wallets', newWallet);
          setWallets(prev => [...prev, result]);
          break;
        }
        case 'UPDATE_WALLET': {
          const result = await apiPut(`/wallets/${action.payload.id}`, action.payload);
          setWallets(prev => prev.map(w => w.id === result.id ? result : w));
          break;
        }
        case 'DELETE_WALLET': {
          await apiDelete(`/wallets/${action.payload}`);
          setWallets(prev => prev.filter(w => w.id !== action.payload));
          break;
        }
        case 'ADD_BUDGET': {
          const newBudget = { ...action.payload, id: generateId() };
          const result = await apiPost('/budgets', newBudget);
          setBudgets(prev => [...prev, result]);
          break;
        }
        case 'UPDATE_BUDGET': {
          const result = await apiPut(`/budgets/${action.payload.id}`, action.payload);
          setBudgets(prev => prev.map(b => b.id === result.id ? result : b));
          break;
        }
        case 'DELETE_BUDGET': {
          await apiDelete(`/budgets/${action.payload}`);
          setBudgets(prev => prev.filter(b => b.id !== action.payload));
          break;
        }
        case 'ADD_BILL': {
          const newBill = { ...action.payload, id: generateId() };
          const result = await apiPost('/bills', newBill);
          setBills(prev => [...prev, result]);
          break;
        }
        case 'UPDATE_BILL': {
          const result = await apiPut(`/bills/${action.payload.id}`, action.payload);
          setBills(prev => prev.map(b => b.id === result.id ? result : b));
          break;
        }
        case 'DELETE_BILL': {
          await apiDelete(`/bills/${action.payload}`);
          setBills(prev => prev.filter(b => b.id !== action.payload));
          break;
        }
        case 'ADD_GOAL': {
          const newGoal = { ...action.payload, id: generateId() };
          const result = await apiPost('/goals', newGoal);
          setGoals(prev => [...prev, result]);
          break;
        }
        case 'UPDATE_GOAL': {
          const result = await apiPut(`/goals/${action.payload.id}`, action.payload);
          setGoals(prev => prev.map(g => g.id === result.id ? result : g));
          break;
        }
        case 'DELETE_GOAL': {
          await apiDelete(`/goals/${action.payload}`);
          setGoals(prev => prev.filter(g => g.id !== action.payload));
          break;
        }
        case 'ADD_DEBT': {
          const newDebt = { ...action.payload, id: generateId() };
          const result = await apiPost('/debts', newDebt);
          setDebts(prev => [...prev, result]);
          break;
        }
        case 'UPDATE_DEBT': {
          const result = await apiPut(`/debts/${action.payload.id}`, action.payload);
          setDebts(prev => prev.map(d => d.id === result.id ? result : d));
          break;
        }
        case 'DELETE_DEBT': {
          await apiDelete(`/debts/${action.payload}`);
          setDebts(prev => prev.filter(d => d.id !== action.payload));
          break;
        }
        case 'TRANSFER_WALLET': {
          await apiPost('/wallets/transfer', action.payload);
          const updatedWallets = await apiGet('/wallets');
          setWallets(updatedWallets);
          break;
        }
      }
    } catch (err) {
      console.error('API Error:', err);
      alert(err.message); // simple error display, could be improved with toast
      throw err;
    }
  };

  // Computed values
  const getMonthlyStats = useCallback((year, month) => {
    const monthTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense, transactions: monthTxs };
  }, [transactions]);

  const getTotalBalance = useCallback(() => {
    return wallets.reduce((sum, w) => sum + w.balance, 0);
  }, [wallets]);

  const getCategorySpending = useCallback((categoryId, year, month) => {
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && t.categoryId === categoryId
          && d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const value = {
    transactions,
    wallets,
    budgets,
    bills,
    goals,
    debts,
    isLoading,
    error,
    dispatch,
    getMonthlyStats,
    getTotalBalance,
    getCategorySpending,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
