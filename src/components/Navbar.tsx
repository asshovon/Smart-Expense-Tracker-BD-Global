import React from 'react';
import { 
  CurrencyCode, 
  Language, 
  ViewMode 
} from '../types';
import { CURRENCIES } from '../data/initialData';
import { 
  Smartphone, 
  LayoutDashboard, 
  Code2, 
  Calculator, 
  Plus, 
  FileSpreadsheet, 
  Globe2
} from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  baseCurrency: CurrencyCode;
  setBaseCurrency: (currency: CurrencyCode) => void;
  onOpenAddModal: () => void;
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  language,
  setLanguage,
  baseCurrency,
  setBaseCurrency,
  onOpenAddModal,
  onOpenReportModal,
}) => {
  const isBn = language === 'bn';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-xl">
              ৳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Smart Expense
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <span>🇧🇩</span> BD & Global
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {isBn ? 'আয়, ব্যয়, বাজেট, bKash/Nagad ও আন্তর্জাতিক কারেন্সি' : 'Multi-currency, Bangladesh MFS, Android & Web'}
              </p>
            </div>
          </div>

          {/* Center Navigation View Modes */}
          <nav className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('web')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'web'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              aria-label="Web Dashboard View"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{isBn ? 'ওয়েব ড্যাশবোর্ড' : 'Web Dashboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('android_simulator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'android_simulator'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              aria-label="Android App Simulator"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>{isBn ? 'অ্যান্ড্রয়েড অ্যাপ' : 'Android App'}</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1 rounded">Java</span>
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
                aria-label="Base Currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-800 text-white">
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-colors"
              title="Toggle Bengali / English language"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>

            {/* Reports Export */}
            <button
              type="button"
              onClick={onOpenReportModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs font-semibold text-slate-200 transition-colors"
              aria-label="Open Reports and Export"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'রিপোর্ট' : 'Reports'}</span>
            </button>

            {/* Add Transaction Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Add Transaction"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">{isBn ? 'নতুন লেনদেন' : 'Add Record'}</span>
            </button>
          </div>

        </div>

        {/* Mobile View Toggle Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('web')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              viewMode === 'web' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Web</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('android_simulator')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
              viewMode === 'android_simulator' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
        </div>
      </div>
    </header>
  );
};
