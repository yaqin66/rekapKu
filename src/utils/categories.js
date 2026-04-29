import {
  ShoppingCart, Coffee, Car, Home, Zap, Heart, GraduationCap,
  Gamepad2, Shirt, Gift, Utensils, Bus, Smartphone, Wifi,
  Briefcase, TrendingUp, DollarSign, PiggyBank, Building2,
  Banknote, CreditCard, Wallet, HandCoins, CircleDollarSign
} from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Makanan & Minuman', icon: Utensils, color: '#f97316' },
  { id: 'transport', name: 'Transportasi', icon: Car, color: '#3b82f6' },
  { id: 'shopping', name: 'Belanja', icon: ShoppingCart, color: '#ec4899' },
  { id: 'bills', name: 'Tagihan & Utilitas', icon: Zap, color: '#eab308' },
  { id: 'entertainment', name: 'Hiburan', icon: Gamepad2, color: '#8b5cf6' },
  { id: 'health', name: 'Kesehatan', icon: Heart, color: '#ef4444' },
  { id: 'education', name: 'Pendidikan', icon: GraduationCap, color: '#06b6d4' },
  { id: 'housing', name: 'Tempat Tinggal', icon: Home, color: '#14b8a6' },
  { id: 'clothing', name: 'Pakaian', icon: Shirt, color: '#f43f5e' },
  { id: 'gift', name: 'Hadiah & Donasi', icon: Gift, color: '#a855f7' },
  { id: 'coffee', name: 'Kopi & Nongkrong', icon: Coffee, color: '#78716c' },
  { id: 'internet', name: 'Internet & Pulsa', icon: Wifi, color: '#2563eb' },
  { id: 'gadget', name: 'Gadget & Elektronik', icon: Smartphone, color: '#334155' },
  { id: 'other_expense', name: 'Lainnya', icon: CircleDollarSign, color: '#64748b' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Gaji', icon: Briefcase, color: '#22c55e' },
  { id: 'freelance', name: 'Freelance', icon: HandCoins, color: '#10b981' },
  { id: 'investment', name: 'Investasi', icon: TrendingUp, color: '#0ea5e9' },
  { id: 'bonus', name: 'Bonus', icon: DollarSign, color: '#f59e0b' },
  { id: 'business', name: 'Bisnis', icon: Building2, color: '#6366f1' },
  { id: 'other_income', name: 'Lainnya', icon: Banknote, color: '#64748b' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id) {
  return ALL_CATEGORIES.find(cat => cat.id === id) || {
    id: 'unknown',
    name: 'Tidak Diketahui',
    icon: CircleDollarSign,
    color: '#94a3b8',
  };
}

export const DEFAULT_WALLETS = [
  { id: 'cash', name: 'Cash', icon: 'Wallet', color: '#22c55e', balance: 0 },
  { id: 'bank_bca', name: 'Bank BCA', icon: 'CreditCard', color: '#2563eb', balance: 0 },
  { id: 'gopay', name: 'GoPay', icon: 'Smartphone', color: '#00aa13', balance: 0 },
];

export const WALLET_ICONS = { Wallet, CreditCard, Smartphone, PiggyBank, Building2, Banknote };
