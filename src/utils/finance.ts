import { Account, Budget, CurrencyCode, Language, Transaction } from '../types';

export const DEFAULT_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  BDT: 122.5,  // 1 USD = 122.50 BDT
  EUR: 0.92,   // 1 USD = 0.92 EUR
  GBP: 0.78,   // 1 USD = 0.78 GBP
  INR: 84.2,   // 1 USD = 84.2 INR
  SAR: 3.75,   // 1 USD = 3.75 SAR (Saudi Riyal)
  AED: 3.67,   // 1 USD = 3.67 AED (UAE Dirham)
  CAD: 1.38,   // 1 USD = 1.38 CAD
  AUD: 1.52,   // 1 USD = 1.52 AUD
  JPY: 153.0,  // 1 USD = 153 JPY
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  SAR: '﷼',
  AED: 'د.إ',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
};

/**
 * Converts any amount from one currency to another using USD-pegged rates.
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Record<CurrencyCode, number> = DEFAULT_RATES_TO_USD
): number {
  if (from === to) return amount;
  const rateFrom = rates[from] || 1;
  const rateTo = rates[to] || 1;
  // Convert from currency to USD, then from USD to target currency
  const inUSD = amount / rateFrom;
  const inTarget = inUSD * rateTo;
  return Math.round(inTarget * 100) / 100;
}

/**
 * Converts English numerals to Bengali numerals if language is 'bn'
 */
export function toBengaliNumerals(val: string | number): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
}

/**
 * Formats monetary value with currency symbol and locale-appropriate format
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'BDT',
  lang: Language = 'en'
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const abs = Math.abs(amount);
  const formattedNumber = abs.toLocaleString('en-US', {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  const sign = amount < 0 ? '-' : '';

  if (lang === 'bn') {
    const bnNum = toBengaliNumerals(formattedNumber);
    if (currency === 'BDT') {
      return `${sign}৳${bnNum}`;
    }
    return `${sign}${symbol}${bnNum}`;
  }

  if (currency === 'BDT') {
    return `${sign}৳${formattedNumber}`;
  }
  return `${sign}${symbol}${formattedNumber}`;
}

/**
 * Calculate totals and net savings for a list of transactions in a base currency
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  baseCurrency: CurrencyCode = 'BDT',
  rates: Record<CurrencyCode, number> = DEFAULT_RATES_TO_USD
) {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalTransferFee = 0;

  for (const t of transactions) {
    const amountInBase = convertCurrency(t.amount, t.currency, baseCurrency, rates);
    if (t.type === 'income') {
      totalIncome += amountInBase;
    } else if (t.type === 'expense') {
      totalExpense += amountInBase;
    } else if (t.type === 'transfer' && t.transferFee) {
      const feeInBase = convertCurrency(t.transferFee, t.currency, baseCurrency, rates);
      totalTransferFee += feeInBase;
      totalExpense += feeInBase;
    }
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    savingsRate,
    totalTransferFee: Math.round(totalTransferFee * 100) / 100,
  };
}

/**
 * Calculate dynamic account balance given initial balance and list of transactions
 */
export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const acc of accounts) {
    balances[acc.id] = acc.balance;
  }

  for (const tx of transactions) {
    if (tx.type === 'income') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] += tx.amount;
      }
    } else if (tx.type === 'expense') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] -= tx.amount;
      }
    } else if (tx.type === 'transfer') {
      if (balances[tx.accountId] !== undefined) {
        balances[tx.accountId] -= tx.amount + (tx.transferFee || 0);
      }
      if (tx.targetAccountId && balances[tx.targetAccountId] !== undefined) {
        // Find currency conversion if transfer is across different currencies
        const sourceAcc = accounts.find((a) => a.id === tx.accountId);
        const targetAcc = accounts.find((a) => a.id === tx.targetAccountId);
        let receivedAmount = tx.amount;
        if (sourceAcc && targetAcc && sourceAcc.currency !== targetAcc.currency) {
          receivedAmount = convertCurrency(tx.amount, sourceAcc.currency, targetAcc.currency);
        }
        balances[tx.targetAccountId] += receivedAmount;
      }
    }
  }

  return balances;
}

/**
 * Calculate budget status and spent progress
 */
export function calculateBudgetStatus(
  budget: Budget,
  transactions: Transaction[],
  month: string, // YYYY-MM
  rates: Record<CurrencyCode, number> = DEFAULT_RATES_TO_USD
) {
  const categoryTxs = transactions.filter(
    (t) => t.type === 'expense' && t.categoryId === budget.categoryId && t.date.startsWith(month)
  );

  let spent = 0;
  for (const t of categoryTxs) {
    spent += convertCurrency(t.amount, t.currency, budget.currency, rates);
  }

  spent = Math.round(spent * 100) / 100;
  const remaining = Math.round((budget.monthlyLimit - spent) * 100) / 100;
  const percentage = budget.monthlyLimit > 0 ? Math.round((spent / budget.monthlyLimit) * 100) : 0;

  return {
    spent,
    limit: budget.monthlyLimit,
    remaining,
    percentage,
    isOver: spent > budget.monthlyLimit,
    isWarning: percentage >= 80 && spent <= budget.monthlyLimit,
  };
}

/**
 * Bangladesh Zakat Calculator
 * Standard Silver Nisab threshold: 52.5 Tola (~612.36g) approx ৳105,000 (configurable)
 * Rate: 2.5% on net zakatable surplus after 1 lunar year
 */
export interface ZakatInputs {
  cashInHandAndBanks: number;
  goldSilverValue: number;
  businessStockAndInvestments: number;
  loansGivenCollectable: number;
  immediateDebtsAndDueBills: number;
  nisabThreshold: number; // default ~105,000 BDT
}

export function calculateZakat(inputs: ZakatInputs): {
  totalZakatableAssets: number;
  netZakatableWealth: number;
  isEligible: boolean;
  zakatPayable: number;
} {
  const gross =
    (inputs.cashInHandAndBanks || 0) +
    (inputs.goldSilverValue || 0) +
    (inputs.businessStockAndInvestments || 0) +
    (inputs.loansGivenCollectable || 0);

  const liabilities = inputs.immediateDebtsAndDueBills || 0;
  const net = Math.max(0, gross - liabilities);
  const isEligible = net >= (inputs.nisabThreshold || 105000);
  const zakatPayable = isEligible ? Math.round(net * 0.025) : 0;

  return {
    totalZakatableAssets: gross,
    netZakatableWealth: net,
    isEligible,
    zakatPayable,
  };
}

/**
 * Bangladesh DPS (Deposit Pension Scheme) Maturity Calculator
 * A = P * ((1 + r/n)^(nt) - 1) / (r/n) * (1 + r/n)
 * P = monthly deposit, r = annual interest rate (e.g. 8% = 0.08), t = years, n = 12
 */
export function calculateDPSMaturity(
  monthlyDeposit: number,
  annualInterestPercent: number,
  tenureYears: number
): {
  totalPrincipal: number;
  totalInterest: number;
  maturityAmount: number;
  estimatedTaxDeduction: number; // e.g. 10% or 15% with TIN
} {
  const n = 12;
  const totalMonths = tenureYears * n;
  const totalPrincipal = monthlyDeposit * totalMonths;
  const r = (annualInterestPercent || 7.5) / 100;
  const monthlyRate = r / n;

  // Future value of an annuity due
  const maturityAmount =
    monthlyDeposit *
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const roundedMaturity = Math.round(maturityAmount);
  const totalInterest = Math.max(0, roundedMaturity - totalPrincipal);
  const estimatedTaxDeduction = Math.round(totalInterest * 0.1); // 10% source tax with TIN

  return {
    totalPrincipal,
    totalInterest,
    maturityAmount: roundedMaturity,
    estimatedTaxDeduction,
  };
}
