// Local Storage utilities for Meu Bolso

import type { 
  Transaction, 
  Category, 
  CreditCard, 
  CardPurchase, 
  CardBill, 
  Investment, 
  InvestmentMovement, 
  Alert,
  AppSettings,
  BackupData
} from '@/types/finance';
import { DEFAULT_CATEGORIES } from '@/types/finance';

export type { AppSettings };

const STORAGE_KEYS = {
  SETTINGS: 'meubolso_settings',
  TRANSACTIONS: 'meubolso_transactions',
  CATEGORIES: 'meubolso_categories',
  CREDIT_CARDS: 'meubolso_credit_cards',
  CARD_PURCHASES: 'meubolso_card_purchases',
  CARD_BILLS: 'meubolso_card_bills',
  INVESTMENTS: 'meubolso_investments',
  INVESTMENT_MOVEMENTS: 'meubolso_investment_movements',
  ALERTS: 'meubolso_alerts',
} as const;

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Settings
export function getSettings(): AppSettings | null {
  return getItem<AppSettings | null>(STORAGE_KEYS.SETTINGS, null);
}

export function saveSettings(settings: AppSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

export function initializeSettings(pin: string): AppSettings {
  const settings: AppSettings = {
    pin,
    useBiometrics: false,
    darkMode: false,
    currency: 'BRL',
    language: 'pt-BR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveSettings(settings);
  return settings;
}

// Categories
export function getCategories(): Category[] {
  const categories = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, []);
  if (categories.length === 0) {
    return initializeDefaultCategories();
  }
  return categories;
}

export function saveCategories(categories: Category[]): void {
  setItem(STORAGE_KEYS.CATEGORIES, categories);
}

export function initializeDefaultCategories(): Category[] {
  const categories: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
    ...cat,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }));
  saveCategories(categories);
  return categories;
}

export function addCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
  const categories = getCategories();
  const newCategory: Category = {
    ...category,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;
  categories[index] = { ...categories[index], ...updates };
  saveCategories(categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id && !c.isDefault);
  if (filtered.length === categories.length) return false;
  saveCategories(filtered);
  return true;
}

// Transactions
export function getTransactions(): Transaction[] {
  return getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
}

export function saveTransactions(transactions: Transaction[]): void {
  setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
}

export function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return null;
  transactions[index] = { 
    ...transactions[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveTransactions(transactions);
  return transactions[index];
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  if (filtered.length === transactions.length) return false;
  saveTransactions(filtered);
  return true;
}

export function getTransactionsByMonth(year: number, month: number): Transaction[] {
  const transactions = getTransactions();
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

// Credit Cards
export function getCreditCards(): CreditCard[] {
  return getItem<CreditCard[]>(STORAGE_KEYS.CREDIT_CARDS, []);
}

export function saveCreditCards(cards: CreditCard[]): void {
  setItem(STORAGE_KEYS.CREDIT_CARDS, cards);
}

export function addCreditCard(card: Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>): CreditCard {
  const cards = getCreditCards();
  const newCard: CreditCard = {
    ...card,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  cards.push(newCard);
  saveCreditCards(cards);
  return newCard;
}

export function updateCreditCard(id: string, updates: Partial<CreditCard>): CreditCard | null {
  const cards = getCreditCards();
  const index = cards.findIndex(c => c.id === id);
  if (index === -1) return null;
  cards[index] = { 
    ...cards[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveCreditCards(cards);
  return cards[index];
}

export function deleteCreditCard(id: string): boolean {
  const cards = getCreditCards();
  const filtered = cards.filter(c => c.id !== id);
  if (filtered.length === cards.length) return false;
  saveCreditCards(filtered);
  return true;
}

// Card Purchases
export function getCardPurchases(): CardPurchase[] {
  return getItem<CardPurchase[]>(STORAGE_KEYS.CARD_PURCHASES, []);
}

export function saveCardPurchases(purchases: CardPurchase[]): void {
  setItem(STORAGE_KEYS.CARD_PURCHASES, purchases);
}

export function addCardPurchase(purchase: Omit<CardPurchase, 'id' | 'createdAt'>): CardPurchase {
  const purchases = getCardPurchases();
  const newPurchase: CardPurchase = {
    ...purchase,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  purchases.push(newPurchase);
  saveCardPurchases(purchases);
  return newPurchase;
}

export function getCardPurchasesByCard(cardId: string): CardPurchase[] {
  return getCardPurchases().filter(p => p.cardId === cardId);
}

// Card Bills
export function getCardBills(): CardBill[] {
  return getItem<CardBill[]>(STORAGE_KEYS.CARD_BILLS, []);
}

export function saveCardBills(bills: CardBill[]): void {
  setItem(STORAGE_KEYS.CARD_BILLS, bills);
}

export function addCardBill(bill: Omit<CardBill, 'id' | 'createdAt'>): CardBill {
  const bills = getCardBills();
  const newBill: CardBill = {
    ...bill,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  bills.push(newBill);
  saveCardBills(bills);
  return newBill;
}

// Investments
export function getInvestments(): Investment[] {
  return getItem<Investment[]>(STORAGE_KEYS.INVESTMENTS, []);
}

export function saveInvestments(investments: Investment[]): void {
  setItem(STORAGE_KEYS.INVESTMENTS, investments);
}

export function addInvestment(investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): Investment {
  const investments = getInvestments();
  const newInvestment: Investment = {
    ...investment,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  investments.push(newInvestment);
  saveInvestments(investments);
  return newInvestment;
}

export function updateInvestment(id: string, updates: Partial<Investment>): Investment | null {
  const investments = getInvestments();
  const index = investments.findIndex(i => i.id === id);
  if (index === -1) return null;
  investments[index] = { 
    ...investments[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveInvestments(investments);
  return investments[index];
}

export function deleteInvestment(id: string): boolean {
  const investments = getInvestments();
  const filtered = investments.filter(i => i.id !== id);
  if (filtered.length === investments.length) return false;
  saveInvestments(filtered);
  return true;
}

// Investment Movements
export function getInvestmentMovements(): InvestmentMovement[] {
  return getItem<InvestmentMovement[]>(STORAGE_KEYS.INVESTMENT_MOVEMENTS, []);
}

export function saveInvestmentMovements(movements: InvestmentMovement[]): void {
  setItem(STORAGE_KEYS.INVESTMENT_MOVEMENTS, movements);
}

export function addInvestmentMovement(movement: Omit<InvestmentMovement, 'id' | 'createdAt'>): InvestmentMovement {
  const movements = getInvestmentMovements();
  const newMovement: InvestmentMovement = {
    ...movement,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  movements.push(newMovement);
  saveInvestmentMovements(movements);
  
  // Update investment balance
  const investments = getInvestments();
  const investmentIndex = investments.findIndex(i => i.id === movement.investmentId);
  if (investmentIndex !== -1) {
    const change = movement.type === 'deposit' ? movement.amount : -movement.amount;
    investments[investmentIndex].currentBalance += change;
    investments[investmentIndex].updatedAt = new Date().toISOString();
    saveInvestments(investments);
  }
  
  return newMovement;
}

export function getMovementsByInvestment(investmentId: string): InvestmentMovement[] {
  return getInvestmentMovements().filter(m => m.investmentId === investmentId);
}

// Alerts
export function getAlerts(): Alert[] {
  return getItem<Alert[]>(STORAGE_KEYS.ALERTS, []);
}

export function saveAlerts(alerts: Alert[]): void {
  setItem(STORAGE_KEYS.ALERTS, alerts);
}

export function addAlert(alert: Omit<Alert, 'id' | 'createdAt'>): Alert {
  const alerts = getAlerts();
  const newAlert: Alert = {
    ...alert,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  saveAlerts(alerts);
  return newAlert;
}

export function markAlertAsRead(id: string): void {
  const alerts = getAlerts();
  const index = alerts.findIndex(a => a.id === id);
  if (index !== -1) {
    alerts[index].isRead = true;
    saveAlerts(alerts);
  }
}

export function getUnreadAlertsCount(): number {
  return getAlerts().filter(a => !a.isRead).length;
}

// Backup & Restore
export function exportBackup(): BackupData {
  const settings = getSettings();
  if (!settings) throw new Error('No settings found');
  
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    settings,
    categories: getCategories(),
    transactions: getTransactions(),
    creditCards: getCreditCards(),
    cardPurchases: getCardPurchases(),
    cardBills: getCardBills(),
    investments: getInvestments(),
    investmentMovements: getInvestmentMovements(),
    alerts: getAlerts(),
  };
}

export function importBackup(data: BackupData): void {
  saveSettings({ ...data.settings, updatedAt: new Date().toISOString() });
  saveCategories(data.categories);
  saveTransactions(data.transactions);
  saveCreditCards(data.creditCards);
  saveCardPurchases(data.cardPurchases);
  saveCardBills(data.cardBills);
  saveInvestments(data.investments);
  saveInvestmentMovements(data.investmentMovements);
  saveAlerts(data.alerts);
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
