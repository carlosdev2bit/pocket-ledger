// Core Types for Meu Bolso Finance App

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO date string
  isRecurring: boolean;
  recurrenceType?: 'weekly' | 'monthly' | 'yearly';
  installments?: number;
  currentInstallment?: number;
  parentTransactionId?: string; // For installments
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number; // 1-31
  dueDay: number; // 1-31
  color: string;
  lastFourDigits?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardPurchase {
  id: string;
  cardId: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  installments: number;
  currentInstallment: number;
  totalAmount: number; // Total if installments
  createdAt: string;
}

export interface CardBill {
  id: string;
  cardId: string;
  month: number;
  year: number;
  totalAmount: number;
  dueDate: string;
  closingDate: string;
  isPaid: boolean;
  paidAt?: string;
  purchases: string[]; // CardPurchase IDs
  createdAt: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string; // User-defined: Poupança, CDB, Fundos, etc.
  currentBalance: number;
  yieldPercentage: number; // Annual yield rate (manual input)
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentMovement {
  id: string;
  investmentId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'bill_due' | 'limit_warning' | 'expense_high';
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'card' | 'bill' | 'category';
  createdAt: string;
}

export interface MonthSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface AppSettings {
  pin: string;
  useBiometrics: boolean;
  darkMode: boolean;
  currency: string;
  language: string;
  lastBackup?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  settings: AppSettings;
  categories: Category[];
  transactions: Transaction[];
  creditCards: CreditCard[];
  cardPurchases: CardPurchase[];
  cardBills: CardBill[];
  investments: Investment[];
  investmentMovements: InvestmentMovement[];
  alerts: Alert[];
}

// Utility types
export type TransactionFilter = {
  type?: 'income' | 'expense';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

export type MonthYear = {
  month: number;
  year: number;
};

// Default categories
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Salário', icon: 'Wallet', type: 'income', color: '142 76% 36%', isDefault: true },
  { name: 'Freelance', icon: 'Laptop', type: 'income', color: '199 89% 48%', isDefault: true },
  { name: 'Investimentos', icon: 'TrendingUp', type: 'income', color: '174 62% 47%', isDefault: true },
  { name: 'Outros', icon: 'Plus', type: 'both', color: '150 10% 45%', isDefault: true },
  { name: 'Alimentação', icon: 'Utensils', type: 'expense', color: '25 95% 53%', isDefault: true },
  { name: 'Transporte', icon: 'Car', type: 'expense', color: '199 89% 48%', isDefault: true },
  { name: 'Moradia', icon: 'Home', type: 'expense', color: '262 83% 58%', isDefault: true },
  { name: 'Saúde', icon: 'Heart', type: 'expense', color: '0 84% 60%', isDefault: true },
  { name: 'Educação', icon: 'GraduationCap', type: 'expense', color: '38 92% 50%', isDefault: true },
  { name: 'Lazer', icon: 'Gamepad2', type: 'expense', color: '330 81% 60%', isDefault: true },
  { name: 'Compras', icon: 'ShoppingBag', type: 'expense', color: '280 65% 60%', isDefault: true },
  { name: 'Serviços', icon: 'Wrench', type: 'expense', color: '200 18% 46%', isDefault: true },
];
