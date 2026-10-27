import React, { useState } from 'react';
import { CurrencyCode, Language } from '../types';
import { 
  calculateZakat, 
  calculateDPSMaturity, 
  formatCurrency, 
  toBengaliNumerals 
} from '../utils/finance';
import { 
  HeartHandshake, 
  PiggyBank, 
  Zap, 
  CheckCircle, 
  Info, 
  Sparkles,
  Calculator,
  Flame,
  Droplets,
  Wifi,
  PhoneCall
} from 'lucide-react';

interface BangladeshToolsProps {
  language: Language;
  baseCurrency: CurrencyCode;
  onPayBillQuickAction?: (title: string, amount: number, merchant: string) => void;
}

export const BangladeshTools: React.FC<BangladeshToolsProps> = ({
  language,
  baseCurrency,
  onPayBillQuickAction,
}) => {
  const isBn = language === 'bn';
  const [activeSubTab, setActiveSubTab] = useState<'zakat' | 'dps' | 'utility_bills' | 'eid_budget'>('zakat');

  // Zakat State
  const [cash, setCash] = useState<number>(180000);
  const [goldSilver, setGoldSilver] = useState<number>(75000);
  const [businessStock, setBusinessStock] = useState<number>(0);
  const [receivables, setReceivables] = useState<number>(20000);
  const [debts, setDebts] = useState<number>(15000);
  const [nisab, setNisab] = useState<number>(105000); // 52.5 Tola silver in BDT

  const zakatResult = calculateZakat({
    cashInHandAndBanks: cash,
    goldSilverValue: goldSilver,
    businessStockAndInvestments: businessStock,
    loansGivenCollectable: receivables,
    immediateDebtsAndDueBills: debts,
    nisabThreshold: nisab,
  });

  // DPS State
  const [dpsDeposit, setDpsDeposit] = useState<number>(5000);
  const [dpsRate, setDpsRate] = useState<number>(8.5);
  const [dpsYears, setDpsYears] = useState<number>(5);
  const dpsResult = calculateDPSMaturity(dpsDeposit, dpsRate, dpsYears);

  // Eid / Festival Budget State
  const [animalCost, setAnimalCost] = useState<number>(75000);
  const [butcherCost, setButcherCost] = useState<number>(7000);
  const [spicesGroceries, setSpicesGroceries] = useState<number>(8000);
  const [giftsSalami, setGiftsSalami] = useState<number>(12000);
  const [charitySadaqah, setCharitySadaqah] = useState<number>(10000);
  const totalEidBudget = animalCost + butcherCost + spicesGroceries + giftsSalami + charitySadaqah;

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('zakat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'zakat'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-emerald-300" />
          <span>{isBn ? 'যাকাত ক্যালকুলেটর (Zakat BD)' : 'Zakat Calculator (BD)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('dps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'dps'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <PiggyBank className="w-4 h-4 text-purple-300" />
          <span>{isBn ? 'ডিপিএস ও সঞ্চয়পত্র হিসাব (DPS)' : 'DPS & Savings Calculator'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('utility_bills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'utility_bills'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>{isBn ? 'ইউটিলিটি ও বিল পে (DESCO/WASA)' : 'BD Utility Bills Pay'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('eid_budget')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'eid_budget'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-300" />
          <span>{isBn ? 'কোরবানি ও উৎসব বাজেট' : 'Festival & Eid Budget'}</span>
        </button>
      </div>

      {/* 1. Zakat Calculator Tab */}
      {activeSubTab === 'zakat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">
                  {isBn ? 'সহজ যাকাত হিসাব (শরীয়াহ অনুযায়ী ২.৫%)' : 'Smart Zakat BD Calculator'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn 
                    ? 'হাতে ও ব্যাংকে জমানো টাকা, সোনা/রুপা, ব্যবসায়িক স্টক থেকে ঋণ বাদ দিয়ে ২.৫% যাকাত নির্ধারিত হয়।' 
                    : 'Calculate exact 2.5% Zakat based on Islamic Nisab threshold on eligible savings & assets.'}
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                {isBn ? 'নিসাব: ৫২.৫ তোলা রূপা' : 'Silver Nisab Standard'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? '১. নগদ টাকা ও ব্যাংক ব্যালেন্স (৳)' : '1. Cash & Bank Balances (BDT)'}
                </label>
                <input
                  type="number"
                  value={cash}
                  onChange={(e) => setCash(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? '২. সোনা ও রুপার বাজারমূল্য (৳)' : '2. Gold & Silver Market Value (BDT)'}
                </label>
                <input
                  type="number"
                  value={goldSilver}
                  onChange={(e) => setGoldSilver(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? '৩. ব্যবসায়িক পণ্য ও শেয়ার মূল্য (৳)' : '3. Business Inventory & Stocks (BDT)'}
                </label>
                <input
                  type="number"
                  value={businessStock}
                  onChange={(e) => setBusinessStock(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? '৪. ফেরত পাওয়ার যোগ্য ঋণ/পাওনা (৳)' : '4. Collectable Receivables (BDT)'}
                </label>
                <input
                  type="number"
                  value={receivables}
                  onChange={(e) => setReceivables(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-300 mb-1">
                  {isBn ? '৫. বাদ: বর্তমান দেনা ও অবিলম্বে বকেয়া ঋণ (৳)' : '5. Less: Immediate Debts & Due Bills (BDT)'}
                </label>
                <input
                  type="number"
                  value={debts}
                  onChange={(e) => setDebts(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-rose-900/60 rounded-xl px-3 py-2 text-sm font-semibold text-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'নিসাব থ্রেশহোল্ড (চলতি রূপার মূল্য) (৳)' : 'Silver Nisab Benchmark (BDT)'}
                </label>
                <input
                  type="number"
                  value={nisab}
                  onChange={(e) => setNisab(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <HeartHandshake className="w-6 h-6" />
                <h4 className="font-bold text-base text-white">{isBn ? 'যাকাত ফলাফল' : 'Zakat Computation'}</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>{isBn ? 'মোট যাকাতযোগ্য সম্পদ:' : 'Gross Zakatable Assets:'}</span>
                  <span className="font-semibold text-white">{formatCurrency(zakatResult.totalZakatableAssets, 'BDT', language)}</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>{isBn ? 'বাদ দেনা/দায়:' : 'Minus Liabilities:'}</span>
                  <span className="font-semibold">-{formatCurrency(debts, 'BDT', language)}</span>
                </div>
                <div className="flex justify-between text-slate-200 pt-2 border-t border-slate-800">
                  <span>{isBn ? 'নীট যাকাতযোগ্য উদ্বৃত্ত:' : 'Net Zakatable Surplus:'}</span>
                  <span className="font-bold text-white">{formatCurrency(zakatResult.netZakatableWealth, 'BDT', language)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <span className="text-slate-400">{isBn ? 'নিসাব স্ট্যাটাস: ' : 'Nisab Status: '}</span>
                {zakatResult.isEligible ? (
                  <span className="text-emerald-400 font-bold">
                    {isBn ? 'সম্পদ নিসাব অতিক্রম করেছে (যাকাত ফরজ)' : 'Above Nisab (Zakat is Mandatory)'}
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    {isBn ? 'নিসাবের নিচে (যাকাত প্রযোজ্য নয়)' : 'Below Nisab Threshold'}
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-center">
                <p className="text-xs text-emerald-300 font-medium">{isBn ? 'আপনার প্রদেয় যাকাত (২.৫%)' : 'Payable Zakat Amount (2.5%)'}</p>
                <p className="text-3xl font-black text-emerald-400 mt-1">
                  {formatCurrency(zakatResult.zakatPayable, 'BDT', language)}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              {isBn 
                ? '💡 যাকাত প্রদানের খাতসমূহ: অভাবী দরিদ্র, মিসকিন, নওমুসলিম, ঋণগ্রস্ত ব্যক্তি ও আল্লাহর রাস্তায় কল্যাণমূলক কাজ।'
                : '💡 Eligible recipients: The poor, needy, debt-ridden individuals, and those in hardship.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. DPS Calculator Tab */}
      {activeSubTab === 'dps' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {isBn ? 'বাংলাদেশি ব্যাংক ডিপিএস ও সঞ্চয় ক্যালকুলেটর' : 'Bangladesh Bank DPS Compound Calculator'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn 
                  ? 'সোনালী, ব্র্যাক, সিটি, ডাচ-বাংলা বা ইসলামী ব্যাংকের মাসিক ডিপিএস স্কিমের ম্যাচিউরিটি ও মুনাফা যাচাই করুন।'
                  : 'Calculate compound maturity values for commercial bank monthly DPS recurring deposits.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'মাসিক কিস্তির পরিমাণ (৳)' : 'Monthly Deposit (BDT)'}
                </label>
                <input
                  type="number"
                  step="500"
                  value={dpsDeposit}
                  onChange={(e) => setDpsDeposit(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'বার্ষিক সুদের হার (%)' : 'Annual Interest Rate (%)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={dpsRate}
                  onChange={(e) => setDpsRate(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'মেয়াদ (বছর)' : 'Tenure (Years)'}
                </label>
                <select
                  value={dpsYears}
                  onChange={(e) => setDpsYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={1}>1 Year (১ বছর)</option>
                  <option value={2}>2 Years (২ বছর)</option>
                  <option value={3}>3 Years (৩ বছর)</option>
                  <option value={5}>5 Years (৫ বছর)</option>
                  <option value={7}>7 Years (৭ বছর)</option>
                  <option value={10}>10 Years (১০ বছর)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[1000, 2000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDpsDeposit(preset)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium border ${
                    dpsDeposit === preset 
                      ? 'bg-purple-600/30 text-purple-300 border-purple-500/50' 
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  ৳ {preset.toLocaleString()} / মাস
                </button>
              ))}
            </div>
          </div>

          {/* DPS Output Card */}
          <div className="bg-gradient-to-br from-purple-950/80 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-purple-300">
                <PiggyBank className="w-6 h-6" />
                <h4 className="font-bold text-base text-white">{isBn ? 'ডিপিএস ম্যাচিউরিটি' : 'Maturity Summary'}</h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>{isBn ? 'আপনার মোট জমা (আসল):' : 'Total Principal Deposited:'}</span>
                  <span className="font-semibold text-white">{formatCurrency(dpsResult.totalPrincipal, 'BDT', language)}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>{isBn ? 'মোট অর্জিত মুনাফা:' : 'Total Interest / Profit:'}</span>
                  <span className="font-semibold">+{formatCurrency(dpsResult.totalInterest, 'BDT', language)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>{isBn ? 'উৎস কর (TIN সহ ১০%):' : 'Estimated Source Tax (10%):'}</span>
                  <span>-{formatCurrency(dpsResult.estimatedTaxDeduction, 'BDT', language)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/40 text-center">
                <p className="text-xs text-purple-300 font-medium">{isBn ? 'মেয়াদান্তে সম্ভাব্য সর্বমোট প্রাপ্যতা' : 'Estimated Net Maturity Payout'}</p>
                <p className="text-3xl font-black text-purple-300 mt-1">
                  {formatCurrency(dpsResult.maturityAmount - dpsResult.estimatedTaxDeduction, 'BDT', language)}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {dpsYears} {isBn ? 'বছরে মোট কিস্তি: ' : 'Years | Total Installments: '} 
                  {dpsYears * 12}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              {isBn 
                ? '📌 ব্যাংক ভেদে এবং সরকারি ট্যাক্স নিয়মে চূড়ান্ত পরিমাণে সামান্য তারতম্য হতে পারে।'
                : '📌 Bank service charges and variable government tax rates may apply upon final maturity.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Bangladesh Utility Bills Pay */}
      {activeSubTab === 'utility_bills' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-base mb-1">
              {isBn ? 'বাংলাদেশি ইউটিলিটি বিল পরিশোধ ও ট্র্যাকিং' : 'Bangladesh Utility Bills & Recharge'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {isBn 
                ? 'এক ক্লিকে আপনার চলতি মাসের বিদ্যুৎ, গ্যাস, ওয়াসা ও ব্রডব্যান্ড বিলের হিসাব যোগ করুন।' 
                : 'Quickly record common utility bills (DESCO, DPDC, WASA, Titas Gas, Carnival/AmberIT).'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* DESCO */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">DESCO / DPDC</h4>
                      <p className="text-[11px] text-slate-400">{isBn ? 'প্রিপেইড বিদ্যুৎ মিটার' : 'Prepaid Smart Meter'}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold">
                    ৳ 2,500
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Meter: 102938472</span>
                  <button
                    type="button"
                    onClick={() => onPayBillQuickAction?.('DESCO Prepaid Electricity', 2500, 'DESCO Smart Meter')}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 text-xs"
                  >
                    {isBn ? 'বিল যোগ করুন' : '+ Quick Add'}
                  </button>
                </div>
              </div>

              {/* WASA */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Dhaka WASA</h4>
                      <p className="text-[11px] text-slate-400">{isBn ? 'পানি ও সুয়ারেজ বিল' : 'Water Supply'}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold">
                    ৳ 1,420
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Bill ID: WS-99120</span>
                  <button
                    type="button"
                    onClick={() => onPayBillQuickAction?.('Dhaka WASA Monthly Bill', 1420, 'Dhaka WASA')}
                    className="px-3 py-1 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-400 text-xs"
                  >
                    {isBn ? 'বিল যোগ করুন' : '+ Quick Add'}
                  </button>
                </div>
              </div>

              {/* Titas Gas */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-orange-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Titas Gas / Karnaphuli</h4>
                      <p className="text-[11px] text-slate-400">{isBn ? 'বাসার গ্যাস বিল' : 'Piped Gas Bill'}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 font-semibold">
                    ৳ 1,080
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Cust: TG-3392</span>
                  <button
                    type="button"
                    onClick={() => onPayBillQuickAction?.('Titas Gas Monthly Bill', 1080, 'Titas Gas T&D')}
                    className="px-3 py-1 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-400 text-xs"
                  >
                    {isBn ? 'বিল যোগ করুন' : '+ Quick Add'}
                  </button>
                </div>
              </div>

              {/* Broadband Internet */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Carnival / Link3 WiFi</h4>
                      <p className="text-[11px] text-slate-400">{isBn ? 'ব্রডব্যান্ড ইন্টারনেট' : 'Fiber Internet'}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold">
                    ৳ 1,250
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">User: CRN-4019</span>
                  <button
                    type="button"
                    onClick={() => onPayBillQuickAction?.('Carnival Fiber Internet Bill', 1250, 'Carnival Internet')}
                    className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 text-xs"
                  >
                    {isBn ? 'বিল যোগ করুন' : '+ Quick Add'}
                  </button>
                </div>
              </div>

              {/* Mobile Recharge */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-pink-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">GP / Banglalink</h4>
                      <p className="text-[11px] text-slate-400">{isBn ? 'মোবাইল রিচার্জ ও ডাটা' : 'Monthly Data Pack'}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 font-semibold">
                    ৳ 699
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">40GB + 800 Mins</span>
                  <button
                    type="button"
                    onClick={() => onPayBillQuickAction?.('GP Monthly Combo Recharge', 699, 'Grameenphone')}
                    className="px-3 py-1 rounded-lg bg-pink-500 text-white font-bold hover:bg-pink-400 text-xs"
                  >
                    {isBn ? 'বিল যোগ করুন' : '+ Quick Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Eid & Festival Budget Tab */}
      {activeSubTab === 'eid_budget' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {isBn ? 'কোরবানি ও উৎসব বাজেট প্ল্যানার' : 'Eid-ul-Adha & Festival Budget Planner'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn 
                  ? 'কোরবানির পশু, কসাই, মশলা-বাজার ও দান-সদকার খরচের পূর্ব প্রস্তুতি নিন।'
                  : 'Plan festival expenses including sacrificial animal share, butchering, gifts, and charity.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'পশু ক্রয় বা ভাগ (৳)' : 'Sacrificial Animal or Share (BDT)'}
                </label>
                <input
                  type="number"
                  value={animalCost}
                  onChange={(e) => setAnimalCost(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'কসাই ও প্রসেসিং খরচ (৳)' : 'Butcher & Handling Fees (BDT)'}
                </label>
                <input
                  type="number"
                  value={butcherCost}
                  onChange={(e) => setButcherCost(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'মশলা ও ঈদের বাজার (৳)' : 'Spices & Feast Groceries (BDT)'}
                </label>
                <input
                  type="number"
                  value={spicesGroceries}
                  onChange={(e) => setSpicesGroceries(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'ঈদ সালামী ও উপহার (৳)' : 'Eid Salami & Family Gifts (BDT)'}
                </label>
                <input
                  type="number"
                  value={giftsSalami}
                  onChange={(e) => setGiftsSalami(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'দরিদ্রদের দান ও সাদাকাহ (৳)' : 'Charity & Meat Distribution (BDT)'}
                </label>
                <input
                  type="number"
                  value={charitySadaqah}
                  onChange={(e) => setCharitySadaqah(Number(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Eid Total Card */}
          <div className="bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border border-rose-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <Sparkles className="w-6 h-6" />
                <h4 className="font-bold text-base text-white">{isBn ? 'উৎসব বাজেট মোট' : 'Total Festival Budget'}</h4>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-center">
                <p className="text-xs text-rose-300 font-medium">{isBn ? 'মোট প্রত্যাশিত বাজেট' : 'Estimated Total Budget'}</p>
                <p className="text-3xl font-black text-rose-400 mt-1">
                  {formatCurrency(totalEidBudget, 'BDT', language)}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>{isBn ? 'পশু ও কসাই:' : 'Animal & Butcher:'}</span>
                  <span className="font-semibold text-white">{formatCurrency(animalCost + butcherCost, 'BDT', language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isBn ? 'বাজার ও উপহার:' : 'Groceries & Gifts:'}</span>
                  <span className="font-semibold text-white">{formatCurrency(spicesGroceries + giftsSalami, 'BDT', language)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{isBn ? 'দান ও সাহায্য:' : 'Charity & Aid:'}</span>
                  <span className="font-semibold text-white">{formatCurrency(charitySadaqah, 'BDT', language)}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
              {isBn 
                ? '💡 পূর্বে থেকে মাসিক ক্ষুদ্র সঞ্চয়ের মাধ্যমে উৎসবের বড় খরচগুলো চাপমুক্তভাবে নির্বাহ করা যায়।'
                : '💡 Setting a dedicated monthly target helps handle major festive expenses comfortably.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
