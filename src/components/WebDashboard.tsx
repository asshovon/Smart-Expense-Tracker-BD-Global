import React, { useState } from 'react';
import { 
  Account, 
  Budget, 
  Category, 
  CurrencyCode, 
  Language, 
  Transaction 
} from '../types';
import { 
  formatCurrency, 
  calculateFinancialSummary, 
  calculateAccountBalances, 
  calculateBudgetStatus,
  convertCurrency,
  toBengaliNumerals,
  DEFAULT_RATES_TO_USD
} from '../utils/finance';
import { CURRENCIES } from '../data/initialData';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Zap, 
  Search, 
  Filter, 
  Trash2, 
  Receipt, 
  ShieldCheck, 
  AlertTriangle,
  Building2,
  Smartphone,
  Landmark,
  PiggyBank,
  CheckCircle,
  ExternalLink,
  Percent,
  Plus
} from 'lucide-react';

interface WebDashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  language: Language;
  baseCurrency: CurrencyCode;
  onOpenAddModal: () => void;
  onDeleteTransaction: (id: string) => void;
  onPayBillQuickAction: (title: string, amount: number, merchant: string) => void;
  onSwitchToAndroid: () => void;
  onSwitchToStarterCode: () => void;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({
  transactions,
  accounts,
  categories,
  budgets,
  language,
  baseCurrency,
  onOpenAddModal,
  onDeleteTransaction,
  onPayBillQuickAction,
  onSwitchToAndroid,
  onSwitchToStarterCode,
}) => {
  const isBn = language === 'bn';
  const currentMonth = '2026-10';

  // Filters state
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'transfer' | 'mfs'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Mini currency converter widget state
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [convertFrom, setConvertFrom] = useState<CurrencyCode>('USD');
  const [convertTo, setConvertTo] = useState<CurrencyCode>('BDT');

  const summary = calculateFinancialSummary(transactions, baseCurrency);
  const balances = calculateAccountBalances(accounts, transactions);

  // Total Net Worth in base currency
  let totalNetWorthInBase = 0;
  for (const acc of accounts) {
    const currentBal = balances[acc.id] ?? acc.balance;
    totalNetWorthInBase += convertCurrency(currentBal, acc.currency, baseCurrency);
  }

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    // Type Filter
    if (filterType === 'expense' && t.type !== 'expense') return false;
    if (filterType === 'income' && t.type !== 'income') return false;
    if (filterType === 'transfer' && t.type !== 'transfer') return false;
    if (filterType === 'mfs') {
      const acc = accounts.find((a) => a.id === t.accountId);
      const targetAcc = accounts.find((a) => a.id === t.targetAccountId);
      if (!acc?.isBdMfs && !targetAcc?.isBdMfs) return false;
    }

    // Category Filter
    if (selectedCategoryFilter !== 'all' && t.categoryId !== selectedCategoryFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchMerchant = t.merchant?.toLowerCase().includes(q);
      const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchMerchant && !matchTag) return false;
    }

    return true;
  });

  // Calculate category-wise expense breakdown
  const categoryExpenseMap: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === 'expense') {
      const amountInBase = convertCurrency(t.amount, t.currency, baseCurrency);
      categoryExpenseMap[t.categoryId] = (categoryExpenseMap[t.categoryId] || 0) + amountInBase;
    }
  }

  const sortedCategoryExpenses = Object.entries(categoryExpenseMap)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat ? (isBn ? cat.nameBn : cat.name) : catId,
        color: cat?.color || '#3B82F6',
        amount,
        percentage: summary.totalExpense > 0 ? Math.round((amount / summary.totalExpense) * 100) : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      
      {/* 1. Top Executive Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Net Worth */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isBn ? 'মোট সম্পদ / ব্যালেন্স' : 'Total Net Balance'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {formatCurrency(totalNetWorthInBase, baseCurrency, language)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isBn ? 'সব ওয়ালেট ও অ্যাকাউন্ট মিলিয়ে' : 'Across 7 wallets & accounts'}</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isBn ? 'চলতি মাসে মোট আয়' : 'Monthly Income'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            +{formatCurrency(summary.totalIncome, baseCurrency, language)}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            {isBn ? 'চাকরি ও ফ্রিল্যান্সিং রেমিট্যান্স' : 'Salary & Global Remittance'}
          </p>
        </div>

        {/* Monthly Expense */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isBn ? 'চলতি মাসে মোট ব্যয়' : 'Monthly Expense'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">
            -{formatCurrency(summary.totalExpense, baseCurrency, language)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <span>{isBn ? 'ক্যাশআউট চার্জ সহ:' : 'Includes MFS fees:'}</span>
            <span className="font-semibold text-slate-300">
              {formatCurrency(summary.totalTransferFee, baseCurrency, language)}
            </span>
          </div>
        </div>

        {/* Net Savings & Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {isBn ? 'নীট সঞ্চয় ও রেট' : 'Net Savings & Rate'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {formatCurrency(summary.netSavings, baseCurrency, language)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {isBn ? toBengaliNumerals(summary.savingsRate) : summary.savingsRate}%
            </span>
          </div>
        </div>

      </div>

      {/* 2. Quick Actions & Currency Exchange Rates Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Quick Action Shortcuts */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">
              {isBn ? 'দ্রুত অ্যাকশন:' : 'Quick Actions:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isBn ? '+ খরচ যোগ' : '+ Expense'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>{isBn ? '+ আয় যোগ' : '+ Income'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{isBn ? '⇄ ফান্ড ট্রান্সফার' : '⇄ Transfer'}</span>
            </button>

            <button
              type="button"
              onClick={() => onPayBillQuickAction('DESCO Electricity Bill', 2500, 'DESCO Smart Meter')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isBn ? '⚡ DESCO বিল দিন' : '⚡ Pay DESCO'}</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToAndroid}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isBn ? '📱 মোবাইল ভিউ' : '📱 Android View'}</span>
            </button>
          </div>
        </div>

        {/* Currency Rates Converter Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <span>💱</span>
              <span>{isBn ? 'লাইভ কারেন্সি কনভার্টার' : 'Currency Exchange'}</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">1 USD = ৳122.50</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(Number(e.target.value) || 0)}
              className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold"
            />
            <select
              value={convertFrom}
              onChange={(e) => setConvertFrom(e.target.value as CurrencyCode)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-1.5 py-1 text-white text-xs"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
            <span className="text-slate-500">=</span>
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-emerald-400 font-bold truncate">
              {formatCurrency(convertCurrency(convertAmount, convertFrom, convertTo), convertTo, language)}
            </div>
            <select
              value={convertTo}
              onChange={(e) => setConvertTo(e.target.value as CurrencyCode)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-1.5 py-1 text-white text-xs"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* 3. Wallets & Accounts Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">
              {isBn ? 'আপনার ওয়ালেট ও ব্যাংক অ্যাকাউন্টসমূহ' : 'Connected Wallets & Accounts'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBn ? 'বিকাশ, নগদ, বাণিজ্যিক ব্যাংক, ডিপিএস ও নগদ টাকার ব্যালেন্স' : 'bKash, Nagad, Banks, DPS & Global accounts'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            {isBn ? '+ ফান্ড স্থানান্তর' : '+ Transfer Funds'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {accounts.map((acc) => {
            const currentBal = balances[acc.id] ?? acc.balance;
            const isBkash = acc.type === 'BKASH';
            const isNagad = acc.type === 'NAGAD';

            return (
              <div
                key={acc.id}
                className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span 
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        isBkash 
                          ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                          : isNagad 
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {acc.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{acc.currency}</span>
                  </div>

                  <p className="font-bold text-xs text-white line-clamp-1 mt-1">
                    {isBn ? acc.nameBn : acc.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {acc.accountNumber || (isBn ? 'ক্যাশ ওয়ালেট' : 'Cash')}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900">
                  <p className="text-sm font-black text-emerald-400">
                    {formatCurrency(currentBal, acc.currency, language)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Budget Tracking & Category Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Budget Goals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">
                {isBn ? 'মাসিক বাজেট ট্র্যাকার (অক্টোবর ২০২৬)' : 'Monthly Budget Limits (Oct 2026)'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? '৮০% অতিক্রম করলে সতর্কবার্তা প্রদর্শিত হয়' : 'Real-time alert when spending crosses 80%'}
              </p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
              {budgets.length} {isBn ? 'টি ক্যাটাগরি' : 'Categories'}
            </span>
          </div>

          <div className="space-y-3.5">
            {budgets.map((b) => {
              const cat = categories.find((c) => c.id === b.categoryId);
              const status = calculateBudgetStatus(b, transactions, currentMonth);

              return (
                <div key={b.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat?.color || '#3B82F6' }} />
                      <span>{cat ? (isBn ? cat.nameBn : cat.name) : b.categoryId}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        {formatCurrency(status.spent, b.currency, language)} / {formatCurrency(b.monthlyLimit, b.currency, language)}
                      </span>
                      {status.isOver ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {isBn ? 'বাজেট পার' : 'Over'}
                        </span>
                      ) : status.isWarning ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                          {isBn ? '৮০%+ খরচ' : '80%+ Alert'}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {isBn ? 'নিরাপদ' : 'Safe'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status.isOver ? 'bg-rose-500' : status.isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, status.percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Category Breakdown Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm">
              {isBn ? 'ব্যয়ের খাতভিত্তিক অনুপাত' : 'Expense Distribution by Category'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBn ? 'কোন খাতে আপনার টাকার কত শতাংশ ব্যয় হচ্ছে' : 'Breakdown of your spending by category'}
            </p>
          </div>

          <div className="space-y-3">
            {sortedCategoryExpenses.slice(0, 6).map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {formatCurrency(item.amount, baseCurrency, language)}
                    </span>
                    <span className="text-[11px] text-slate-400 w-8 text-right font-mono">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>{isBn ? 'সর্বমোট রেকর্ডকৃত ব্যয়:' : 'Total Tracked Expenses:'}</span>
            <span className="font-bold text-rose-400">
              {formatCurrency(summary.totalExpense, baseCurrency, language)}
            </span>
          </div>
        </div>

      </div>

      {/* 5. Transactions History Table & Search / Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        {/* Table Header and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">
              {isBn ? 'লেনদেনসমূহের বিস্তারিত হিসাব' : 'Transaction History'}
            </h3>
            <p className="text-xs text-slate-400">
              {isBn ? 'আয়, ব্যয়, ক্যাশআউট এবং ব্যাংক টু বিকাশ ট্রান্সফার' : 'Filter, search, or view receipt attachments'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isBn ? 'নতুন লেনদেন' : 'Add Record'}</span>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'সব' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'expense' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'ব্যয়' : 'Expenses'}
            </button>
            <button
              type="button"
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'income' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'আয়' : 'Income'}
            </button>
            <button
              type="button"
              onClick={() => setFilterType('transfer')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'transfer' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'ট্রান্সফার' : 'Transfers'}
            </button>
            <button
              type="button"
              onClick={() => setFilterType('mfs')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterType === 'mfs' ? 'bg-pink-500/20 text-pink-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isBn ? 'বিকাশ ও নগদ' : 'bKash / Nagad'}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={isBn ? 'শিরোনাম বা মার্চেন্ট খুঁজুন...' : 'Search by title, tag or merchant...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="py-3 px-3">{isBn ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-3">{isBn ? 'বিবরণ ও প্রতিষ্ঠান' : 'Title & Merchant'}</th>
                <th className="py-3 px-3">{isBn ? 'অ্যাকাউন্ট' : 'Account'}</th>
                <th className="py-3 px-3">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="py-3 px-3 text-right">{isBn ? 'পরিমাণ' : 'Amount'}</th>
                <th className="py-3 px-3 text-center">{isBn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    {isBn ? 'কোনো লেনদেন পাওয়া যায়নি।' : 'No transactions found.'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const sourceAcc = accounts.find((a) => a.id === tx.accountId);
                  const targetAcc = accounts.find((a) => a.id === tx.targetAccountId);
                  const cat = categories.find((c) => c.id === tx.categoryId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {tx.date}
                        {tx.time && <span className="block text-[10px] text-slate-500">{tx.time}</span>}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{tx.title}</span>
                          {tx.receiptName && (
                            <span 
                              className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] flex items-center gap-1 border border-emerald-500/20"
                              title={tx.receiptName}
                            >
                              <Receipt className="w-2.5 h-2.5" />
                              <span className="hidden sm:inline">Receipt</span>
                            </span>
                          )}
                        </div>
                        {tx.merchant && (
                          <span className="text-[10px] text-slate-400 block">{tx.merchant}</span>
                        )}
                        {tx.tags && tx.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {tx.tags.map((tg) => (
                              <span key={tg} className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                                #{tg}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-200">
                          {sourceAcc ? (isBn ? sourceAcc.nameBn : sourceAcc.name) : tx.accountId}
                        </div>
                        {tx.type === 'transfer' && targetAcc && (
                          <div className="text-[10px] text-blue-400 flex items-center gap-1">
                            <span>➔</span>
                            <span>{isBn ? targetAcc.nameBn : targetAcc.name}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${cat?.color || '#3B82F6'}20`,
                            color: cat?.color || '#3B82F6',
                          }}
                        >
                          {cat ? (isBn ? cat.nameBn : cat.name) : tx.categoryId}
                        </span>
                      </td>

                      <td className={`py-2.5 px-3 text-right font-black whitespace-nowrap ${
                        tx.type === 'income'
                          ? 'text-emerald-400'
                          : tx.type === 'expense'
                          ? 'text-rose-400'
                          : 'text-blue-400'
                      }`}>
                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                        {formatCurrency(tx.amount, tx.currency, language)}
                        {tx.transferFee && tx.transferFee > 0 ? (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Fee: {formatCurrency(tx.transferFee, tx.currency, language)}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete transaction"
                          aria-label={`Delete transaction ${tx.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
