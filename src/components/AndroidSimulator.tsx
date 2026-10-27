import React, { useState } from 'react';
import { 
  Account, 
  Category, 
  CurrencyCode, 
  Language, 
  Transaction 
} from '../types';
import { 
  formatCurrency, 
  calculateAccountBalances,
  calculateFinancialSummary 
} from '../utils/finance';
import { 
  Wifi, 
  BatteryMedium, 
  Signal, 
  Send, 
  ArrowDownLeft, 
  Smartphone, 
  CreditCard, 
  Zap, 
  Plus, 
  Globe, 
  PiggyBank, 
  QrCode, 
  Eye, 
  EyeOff, 
  Search, 
  Home, 
  ListOrdered, 
  PieChart, 
  Wrench, 
  FileCode,
  ArrowUpRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface AndroidSimulatorProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  language: Language;
  baseCurrency: CurrencyCode;
  onOpenAddModal: () => void;
  onSelectCodeTab: () => void;
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  transactions,
  accounts,
  categories,
  language,
  baseCurrency,
  onOpenAddModal,
  onSelectCodeTab,
}) => {
  const isBn = language === 'bn';
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number>(0);
  const [mobileTab, setMobileTab] = useState<'home' | 'history' | 'services'>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const accountBalances = calculateAccountBalances(accounts, transactions);
  const summary = calculateFinancialSummary(transactions, baseCurrency);

  const selectedAccount = accounts[selectedAccountIndex] || accounts[0];
  const selectedBalance = accountBalances[selectedAccount?.id] ?? selectedAccount?.balance ?? 0;

  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.merchant && t.merchant.toLowerCase().includes(q)) ||
      t.amount.toString().includes(q)
    );
  });

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
      {/* Phone Showcase Frame */}
      <div className="relative w-[380px] h-[780px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col overflow-hidden">
        
        {/* Phone Speaker & Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-50 flex items-center justify-center gap-3">
          <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-700" />
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Android Inner Screen */}
        <div className="relative flex-1 bg-slate-900 rounded-[36px] overflow-hidden flex flex-col text-slate-100 select-none">
          
          {/* 1. Android Status Bar */}
          <div className="pt-3 px-6 pb-1 bg-slate-950 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-20">
            <span>09:41</span>
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>GP 4G</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">100%</span>
                <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* 2. Android App Bar */}
          <div className="bg-slate-950/95 px-5 py-3 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                ৳
              </div>
              <div>
                <h3 className="font-bold text-sm text-white leading-tight">
                  {isBn ? 'স্মার্ট এক্সপেন্স' : 'Smart Expense'}
                </h3>
                <p className="text-[10px] text-emerald-400 font-medium">
                  {isBn ? 'বাংলাদেশ ও গ্লোবাল' : 'BD & Global Edition'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSelectCodeTab}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold hover:bg-emerald-500/30"
              title="View Java Android & Spring Boot source code"
            >
              <FileCode className="w-3 h-3" />
              <span>Java Code</span>
            </button>
          </div>

          {/* 3. Scrollable Screen Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-xs">
            
            {mobileTab === 'home' && (
              <>
                {/* Balance Card & Wallet Slider */}
                <div 
                  className="rounded-2xl p-4 text-white shadow-lg relative overflow-hidden transition-all duration-300"
                  style={{
                    background: selectedAccount.type === 'BKASH'
                      ? 'linear-gradient(135deg, #E2136E 0%, #A20A4E 100%)'
                      : selectedAccount.type === 'NAGAD'
                      ? 'linear-gradient(135deg, #F7941D 0%, #C36803 100%)'
                      : 'linear-gradient(135deg, #059669 0%, #064E3B 100%)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-white/90 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
                      {isBn ? selectedAccount.nameBn : selectedAccount.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
                      aria-label="Toggle balance visibility"
                    >
                      {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="py-1">
                    <p className="text-[11px] text-white/80">
                      {isBn ? 'ব্যালেন্স দেখতে ট্যাপ করুন:' : 'Available Balance:'}
                    </p>
                    <p className="text-2xl font-black tracking-tight mt-0.5">
                      {showBalance
                        ? formatCurrency(selectedBalance, selectedAccount.currency, language)
                        : '••••••••'}
                    </p>
                  </div>

                  {/* Wallet quick selector dots */}
                  <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
                    <span className="text-white/80">
                      {selectedAccount.accountNumber || (isBn ? 'ডিফল্ট ওয়ালেট' : 'Primary Wallet')}
                    </span>
                    <div className="flex gap-1.5">
                      {accounts.slice(0, 4).map((acc, idx) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setSelectedAccountIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            selectedAccountIndex === idx ? 'bg-white w-4' : 'bg-white/40'
                          }`}
                          aria-label={`Select account ${acc.name}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 8-Grid MFS Services (bKash / Nagad style) */}
                <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                  <p className="text-[11px] font-bold text-slate-300 mb-2.5 px-1">
                    {isBn ? 'বাংলাদেশি সার্ভিস ও পেমেন্ট' : 'BD Quick Services'}
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                        <Send className="w-4 h-4" />
                      </div>
                      <span className="leading-tight text-slate-300 font-medium">{isBn ? 'সেন্ড মানি' : 'Send'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <span className="leading-tight text-slate-300 font-medium">{isBn ? 'ক্যাশ আউট' : 'Cash Out'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <span className="leading-tight text-slate-300 font-medium">{isBn ? 'রিচার্জ' : 'Recharge'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="leading-tight text-slate-300 font-medium">{isBn ? 'বিল পে' : 'Pay Bill'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <span className="leading-tight text-slate-300 font-medium">{isBn ? 'অ্যাড মানি' : 'Add Money'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <PiggyBank className="w-4 h-4" />
                      </div>
                      <span className="leading-tight text-slate-300 font-medium">{isBn ? 'ডিপিএস' : 'DPS'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="leading-tight text-slate-300 font-medium">{isBn ? 'রেমিট্যান্স' : 'Remittance'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenAddModal}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <span className="leading-tight text-slate-300 font-medium">{isBn ? 'QR পে' : 'QR Scan'}</span>
                    </button>
                  </div>
                </div>

                {/* Monthly Health Card */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {isBn ? 'চলতি মাসে আয়' : 'Income'}
                    </p>
                    <p className="text-sm font-bold text-white mt-1">
                      {formatCurrency(summary.totalIncome, baseCurrency, language)}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {isBn ? 'চলতি মাসে ব্যয়' : 'Expense'}
                    </p>
                    <p className="text-sm font-bold text-white mt-1">
                      {formatCurrency(summary.totalExpense, baseCurrency, language)}
                    </p>
                  </div>
                </div>

                {/* Recent Transactions List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="font-bold text-slate-200 text-xs">
                      {isBn ? 'সাম্প্রতিক লেনদেন' : 'Recent Transactions'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobileTab('history')}
                      className="text-[11px] text-emerald-400 font-medium hover:underline"
                    >
                      {isBn ? 'সব দেখুন' : 'See all'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {transactions.slice(0, 5).map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              t.type === 'income'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : t.type === 'expense'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '⇄'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 text-xs line-clamp-1">{t.title}</p>
                            <p className="text-[10px] text-slate-500">{t.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-xs ${
                              t.type === 'income'
                                ? 'text-emerald-400'
                                : t.type === 'expense'
                                ? 'text-rose-400'
                                : 'text-blue-400'
                            }`}
                          >
                            {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                            {formatCurrency(t.amount, t.currency, language)}
                          </p>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {t.currency}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {mobileTab === 'history' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={isBn ? 'লেনদেন খুঁজুন...' : 'Search transactions...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  {filteredTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white text-xs">{t.title}</p>
                        <p className="text-[10px] text-slate-400">{t.merchant || t.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-xs ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount, t.currency, language)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Android Floating Action Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="absolute bottom-16 right-5 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl flex items-center justify-center font-bold transition-transform hover:scale-105 active:scale-95 z-30"
            title="Add Transaction"
            aria-label="Add transaction in mobile app"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          {/* 5. Android Bottom Navigation Bar */}
          <div className="h-14 bg-slate-950 border-t border-slate-800/80 px-4 flex items-center justify-around text-slate-400 text-[10px] font-medium z-20">
            <button
              type="button"
              onClick={() => setMobileTab('home')}
              className={`flex flex-col items-center gap-0.5 ${
                mobileTab === 'home' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{isBn ? 'হোম' : 'Home'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('history')}
              className={`flex flex-col items-center gap-0.5 ${
                mobileTab === 'history' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>{isBn ? 'ইতিহাস' : 'History'}</span>
            </button>

            <button
              type="button"
              onClick={onSelectCodeTab}
              className="flex flex-col items-center gap-0.5 hover:text-slate-200"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'জাভা সোর্স' : 'Java Code'}</span>
            </button>
          </div>

          {/* 6. Android 3-Button Navigation Bar */}
          <div className="h-6 bg-slate-950 flex items-center justify-center gap-12 text-slate-500 text-xs">
            <span>◀</span>
            <span>⚪</span>
            <span>◼</span>
          </div>

        </div>
      </div>

      {/* Simulator Companion Info & Android Architecture Card */}
      <div className="max-w-md space-y-4 text-slate-200">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
            <Smartphone className="w-4 h-4" />
            <span>{isBn ? 'নেটিভ অ্যান্ড্রয়েড অ্যাপ সিমুলেটর' : 'Native Android App Simulator'}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isBn 
              ? 'এটি আপনার Java Spring Boot Backend এবং PostgreSQL ডাটাবেসের সঙ্গে সংযুক্ত একটি ইন্টারঅ্যাক্টিভ অ্যান্ড্রয়েড অ্যাপ। এতে বিকাশ/নগদ ব্যালেন্স স্লাইডার, MFS সার্ভিস গ্রিড ও রিয়েল-টাইম লেনদেন রয়েছে।'
              : 'Interactive Android simulator demonstrating Java + XML mobile layout, bKash/Nagad MFS widgets, and live transaction sync with the Spring Boot backend.'}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isBn ? 'মোবাইল ফ্রেমওয়ার্ক:' : 'Mobile Framework:'}</span>
              <span className="font-semibold text-white">Android SDK 34 (Java + XML)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isBn ? 'লোকাল অফলাইন ক্যাশিং:' : 'Offline DB:'}</span>
              <span className="font-semibold text-emerald-400">Room DB / SQLite</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{isBn ? 'ব্যাকএন্ড কানেক্টিভিটি:' : 'Backend API:'}</span>
              <span className="font-semibold text-white">Retrofit 2 + OkHttp (HTTPS)</span>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onSelectCodeTab}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{isBn ? 'Android Java কোড দেখুন' : 'Inspect Android Java Code'}</span>
            </button>
          </div>
        </div>

        {/* Quick Simulator Tips */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2 text-slate-400">
          <p className="font-semibold text-slate-200">{isBn ? 'সিমুলেটরে যা যা করতে পারেন:' : 'Try interacting with:'}</p>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            <li>{isBn ? 'চোখ আইকনে ট্যাপ করে বিকাশ ব্যালেন্স লুকান বা দেখান।' : 'Tap the Eye icon to hide/show account balance.'}</li>
            <li>{isBn ? 'কার্ডের ডট বাটনে ক্লিক করে বিকাশ, নগদ ও ব্যাংকের মাঝে ওয়ালেট পাল্টান।' : 'Click the bottom indicator dots to switch between bKash, Nagad, and City Bank.'}</li>
            <li>{isBn ? 'সবুজ (+) বাটনে ক্লিক করে নতুন আয়, ব্যয় বা ক্যাশআউট যোগ করুন।' : 'Tap the green (+) Floating Action Button to add an expense.'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
