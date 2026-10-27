import React, { useState, useEffect } from 'react';
import { 
  Account, 
  Budget, 
  Category, 
  CurrencyCode, 
  Language, 
  Transaction, 
  ViewMode 
} from './types';
import { 
  INITIAL_ACCOUNTS, 
  INITIAL_BUDGETS, 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { WebDashboard } from './components/WebDashboard';
import { AndroidSimulator } from './components/AndroidSimulator';
import { BangladeshTools } from './components/BangladeshTools';
import { ArchitectureStarterHub } from './components/ArchitectureStarterHub';
import { TransactionModal } from './components/TransactionModal';
import { ReportModal } from './components/ReportModal';
import { 
  LayoutDashboard, 
  Smartphone, 
  Calculator, 
  Code2, 
  FileSpreadsheet, 
  RotateCcw,
  Heart,
  Globe2
} from 'lucide-react';

export default function App() {
  // Local storage persistence
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('smart_expense_lang');
    return (saved as Language) || 'bn';
  });

  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('smart_expense_currency');
    return (saved as CurrencyCode) || 'BDT';
  });

  const [viewMode, setViewMode] = useState<ViewMode>('web');
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'android' | 'bd_tools' | 'architecture'>('dashboard');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('smart_expense_txs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('smart_expense_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ACCOUNTS;
      }
    }
    return INITIAL_ACCOUNTS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('smart_expense_budgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_BUDGETS;
      }
    }
    return INITIAL_BUDGETS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('smart_expense_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('smart_expense_currency', baseCurrency);
  }, [baseCurrency]);

  useEffect(() => {
    localStorage.setItem('smart_expense_txs', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('smart_expense_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Sync viewMode changes with activeMainTab
  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'web') {
      setActiveMainTab('dashboard');
    } else {
      setActiveMainTab('android');
    }
  };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const created: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setTransactions((prev) => [created, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handlePayBillQuickAction = (title: string, amount: number, merchant: string) => {
    const bkashAcc = accounts.find((a) => a.type === 'BKASH') || accounts[0];
    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'expense',
      amount,
      currency: 'BDT',
      accountId: bkashAcc.id,
      categoryId: 'cat_utilities',
      title,
      merchant,
      note: 'Auto-recorded via BD Quick Bill Pay',
      tags: ['UtilityBill', 'QuickPay'],
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleResetData = () => {
    if (window.confirm(language === 'bn' ? 'আপনি কি ডেমো ডাটা পুনরায় লোড করতে চান?' : 'Reset all transactions and accounts to default demo data?')) {
      setTransactions(INITIAL_TRANSACTIONS);
      setAccounts(INITIAL_ACCOUNTS);
      setBudgets(INITIAL_BUDGETS);
      localStorage.removeItem('smart_expense_txs');
      localStorage.removeItem('smart_expense_accounts');
      localStorage.removeItem('smart_expense_budgets');
    }
  };

  const isBn = language === 'bn';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* 1. Global Navigation Bar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={handleSetViewMode}
        language={language}
        setLanguage={setLanguage}
        baseCurrency={baseCurrency}
        setBaseCurrency={setBaseCurrency}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* 2. Secondary Main Tabs Navigation */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2.5 gap-2 no-scrollbar">
          <div className="flex items-center gap-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveMainTab('dashboard');
                setViewMode('web');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeMainTab === 'dashboard'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{isBn ? 'ড্যাশবোর্ড ও লেনদেন' : 'Dashboard & Cashflow'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMainTab('android');
                setViewMode('android_simulator');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeMainTab === 'android'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'অ্যান্ড্রয়েড সিমুলেটর' : 'Android App Simulator'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('bd_tools')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeMainTab === 'bd_tools'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'বাংলাদেশি টুলস (যাকাত ও DPS)' : 'BD Tools (Zakat & DPS)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                activeMainTab === 'architecture'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{isBn ? 'Java & Starter Code' : 'Java Backend & Starter ZIP'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors whitespace-nowrap"
              title="Reset demo data"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">{isBn ? 'ডেমো রিসেট' : 'Reset Demo'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeMainTab === 'dashboard' && (
          <WebDashboard
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            budgets={budgets}
            language={language}
            baseCurrency={baseCurrency}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onPayBillQuickAction={handlePayBillQuickAction}
            onSwitchToAndroid={() => {
              setActiveMainTab('android');
              setViewMode('android_simulator');
            }}
            onSwitchToStarterCode={() => setActiveMainTab('architecture')}
          />
        )}

        {activeMainTab === 'android' && (
          <AndroidSimulator
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            language={language}
            baseCurrency={baseCurrency}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSelectCodeTab={() => setActiveMainTab('architecture')}
          />
        )}

        {activeMainTab === 'bd_tools' && (
          <BangladeshTools
            language={language}
            baseCurrency={baseCurrency}
            onPayBillQuickAction={handlePayBillQuickAction}
          />
        )}

        {activeMainTab === 'architecture' && (
          <ArchitectureStarterHub language={language} />
        )}
      </main>

      {/* 4. Global Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTransaction}
        accounts={accounts}
        categories={categories}
        language={language}
        baseCurrency={baseCurrency}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        transactions={transactions}
        accounts={accounts}
        categories={categories}
        language={language}
        baseCurrency={baseCurrency}
      />

      {/* 5. Sleek Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Smart Expense BD & Global</span>
            <span>•</span>
            <span>Java 21 • Android SDK • Spring Boot • PostgreSQL</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveMainTab('architecture')}
              className="text-emerald-400 hover:underline"
            >
              {isBn ? 'ডাউনলোড Starter Code ZIP' : 'Download Starter Code ZIP'}
            </button>
            <span>•</span>
            <span>{isBn ? 'বাংলাদেশ ও আন্তর্জাতিক ফিনান্স' : 'Multi-currency Financial System'}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
