export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR' | 'SAR' | 'AED' | 'CAD' | 'AUD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  nameEn: string;
  nameBn: string;
  flag: string;
  rateToUSD: number; // e.g. 1 USD = 120 BDT -> rateToUSD = 0.008333 or BDT per USD = 122.5
}

export type AccountType = 
  | 'BKASH'
  | 'NAGAD'
  | 'ROCKET'
  | 'UPAY'
  | 'BANK_ACCOUNT'
  | 'CASH'
  | 'DPS'
  | 'CREDIT_CARD'
  | 'SAVINGS';

export interface Account {
  id: string;
  name: string;
  nameBn: string;
  type: AccountType;
  accountNumber?: string;
  balance: number;
  currency: CurrencyCode;
  color: string;
  icon: string;
  isBdMfs?: boolean; // Mobile Financial Services (bKash/Nagad)
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  isBdSpecific?: boolean;
}

export interface Transaction {
  id: string;
  date: string; // ISO date YYYY-MM-DD
  time?: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  currency: CurrencyCode;
  accountId: string;
  targetAccountId?: string; // For transfer
  categoryId: string;
  title: string;
  merchant?: string;
  note?: string;
  receiptName?: string;
  tags?: string[];
  transferFee?: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  currency: CurrencyCode;
  period: string; // '2026-10'
}

export interface SavingsGoal {
  id: string;
  title: string;
  titleBn: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  deadline: string;
  category: 'DPS' | 'EMERGENCY' | 'EID_HAJJ' | 'INVESTMENT' | 'GADGET';
}

export type Language = 'en' | 'bn';
export type ViewMode = 'web' | 'android_simulator';
export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'analytics' | 'bd_tools' | 'architecture_starter';
