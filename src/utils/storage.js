const STORAGE_KEYS = {
  TRANSACTIONS: 'rekapku_transactions',
  WALLETS: 'rekapku_wallets',
  BUDGETS: 'rekapku_budgets',
  THEME: 'rekapku_theme',
};

export function loadData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export { STORAGE_KEYS };
