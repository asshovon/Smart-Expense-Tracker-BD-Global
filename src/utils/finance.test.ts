import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertCurrency,
  formatCurrency,
  calculateFinancialSummary,
  calculateAccountBalances,
  calculateBudgetStatus,
  calculateZakat,
  calculateDPSMaturity,
  toBengaliNumerals,
} from './finance.ts';
import { Account, Budget, Transaction } from '../types/index.ts';

test('convertCurrency performs accurate conversions', () => {
  // 100 USD to BDT at 122.5
  const bdt = convertCurrency(100, 'USD', 'BDT');
  assert.equal(bdt, 12250);

  // 12250 BDT to USD
  const usd = convertCurrency(12250, 'BDT', 'USD');
  assert.equal(usd, 100);

  // Same currency
  assert.equal(convertCurrency(500, 'BDT', 'BDT'), 500);
});

test('toBengaliNumerals converts digits correctly', () => {
  assert.equal(toBengaliNumerals(12345), '১২৩৪৫');
  assert.equal(toBengaliNumerals('67890'), '৬৭৮৯০');
});

test('formatCurrency outputs expected formatted strings with symbols', () => {
  assert.equal(formatCurrency(1500, 'BDT', 'en'), '৳1,500');
  assert.equal(formatCurrency(1500, 'BDT', 'bn'), '৳১,৫০০');
  assert.equal(formatCurrency(250.5, 'USD', 'en'), '$250.50');
});

test('calculateFinancialSummary computes total income, expense and savings rate', () => {
  const transactions: Transaction[] = [
    {
      id: 'tx1',
      date: '2026-10-01',
      type: 'income',
      amount: 50000,
      currency: 'BDT',
      accountId: 'acc1',
      categoryId: 'cat_salary',
      title: 'Monthly Salary',
    },
    {
      id: 'tx2',
      date: '2026-10-05',
      type: 'expense',
      amount: 15000,
      currency: 'BDT',
      accountId: 'acc1',
      categoryId: 'cat_rent',
      title: 'Apartment Rent',
    },
    {
      id: 'tx3',
      date: '2026-10-06',
      type: 'transfer',
      amount: 2000,
      currency: 'BDT',
      accountId: 'acc1',
      targetAccountId: 'acc2',
      categoryId: 'cat_transfer',
      title: 'Send to bKash',
      transferFee: 30, // 30 BDT cash-in/transfer fee
    },
  ];

  const summary = calculateFinancialSummary(transactions, 'BDT');
  assert.equal(summary.totalIncome, 50000);
  // Total expense is 15000 rent + 30 transfer fee = 15030
  assert.equal(summary.totalExpense, 15030);
  assert.equal(summary.netSavings, 34970);
  assert.equal(summary.savingsRate, 70);
});

test('calculateAccountBalances correctly calculates wallet balances', () => {
  const accounts: Account[] = [
    {
      id: 'bank1',
      name: 'City Bank',
      nameBn: 'সিটি ব্যাংক',
      type: 'BANK_ACCOUNT',
      balance: 100000,
      currency: 'BDT',
      color: '#059669',
      icon: 'Landmark',
    },
    {
      id: 'bkash1',
      name: 'bKash Personal',
      nameBn: 'বিকাশ পার্সোনাল',
      type: 'BKASH',
      balance: 5000,
      currency: 'BDT',
      color: '#E11D48',
      icon: 'Smartphone',
      isBdMfs: true,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx1',
      date: '2026-10-01',
      type: 'expense',
      amount: 2000,
      currency: 'BDT',
      accountId: 'bkash1',
      categoryId: 'cat_groceries',
      title: 'Shwapno Bazar',
    },
    {
      id: 'tx2',
      date: '2026-10-02',
      type: 'transfer',
      amount: 10000,
      currency: 'BDT',
      accountId: 'bank1',
      targetAccountId: 'bkash1',
      categoryId: 'cat_transfer',
      title: 'Add Money to bKash',
      transferFee: 0,
    },
  ];

  const balances = calculateAccountBalances(accounts, transactions);
  // bank1: 100000 - 10000 = 90000
  assert.equal(balances['bank1'], 90000);
  // bkash1: 5000 - 2000 + 10000 = 13000
  assert.equal(balances['bkash1'], 13000);
});

test('calculateBudgetStatus computes utilization percentage and warning flags', () => {
  const budget: Budget = {
    id: 'b1',
    categoryId: 'food',
    monthlyLimit: 10000,
    currency: 'BDT',
    period: '2026-10',
  };

  const transactions: Transaction[] = [
    {
      id: 't1',
      date: '2026-10-05',
      type: 'expense',
      amount: 8500,
      currency: 'BDT',
      accountId: 'acc1',
      categoryId: 'food',
      title: 'Groceries',
    },
  ];

  const status = calculateBudgetStatus(budget, transactions, '2026-10');
  assert.equal(status.spent, 8500);
  assert.equal(status.percentage, 85);
  assert.equal(status.isWarning, true);
  assert.equal(status.isOver, false);
});

test('calculateZakat evaluates Nisab and payable amounts', () => {
  // Below Nisab
  const lowAssets = calculateZakat({
    cashInHandAndBanks: 50000,
    goldSilverValue: 0,
    businessStockAndInvestments: 0,
    loansGivenCollectable: 0,
    immediateDebtsAndDueBills: 10000,
    nisabThreshold: 105000,
  });
  assert.equal(lowAssets.isEligible, false);
  assert.equal(lowAssets.zakatPayable, 0);

  // Above Nisab (Net 200,000 BDT) -> 2.5% = 5,000 BDT
  const highAssets = calculateZakat({
    cashInHandAndBanks: 150000,
    goldSilverValue: 70000,
    businessStockAndInvestments: 0,
    loansGivenCollectable: 0,
    immediateDebtsAndDueBills: 20000,
    nisabThreshold: 105000,
  });
  assert.equal(highAssets.isEligible, true);
  assert.equal(highAssets.netZakatableWealth, 200000);
  assert.equal(highAssets.zakatPayable, 5000);
});

test('calculateDPSMaturity computes compound returns for Bangladesh banks', () => {
  // 5000 BDT per month for 5 years at 8% annual
  const dps = calculateDPSMaturity(5000, 8, 5);
  assert.equal(dps.totalPrincipal, 300000); // 5000 * 60
  assert.ok(dps.maturityAmount > 360000);
  assert.ok(dps.totalInterest > 60000);
  assert.ok(dps.estimatedTaxDeduction > 0);
});
