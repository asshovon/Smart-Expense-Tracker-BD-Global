import React, { useRef } from 'react';
import { Account, Category, CurrencyCode, Language, Transaction } from '../types';
import { formatCurrency, calculateFinancialSummary } from '../utils/finance';
import { X, Download, Printer, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  language: Language;
  baseCurrency: CurrencyCode;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts,
  categories,
  language,
  baseCurrency,
}) => {
  const isBn = language === 'bn';
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const summary = calculateFinancialSummary(transactions, baseCurrency);

  const getAccountName = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return acc ? (isBn ? acc.nameBn : acc.name) : accId;
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? (isBn ? cat.nameBn : cat.name) : catId;
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Currency', 'Account', 'Category', 'Title', 'Merchant', 'Notes'];
    const rows = transactions.map((t) => [
      `"${t.date}"`,
      `"${t.type}"`,
      t.amount,
      `"${t.currency}"`,
      `"${getAccountName(t.accountId)}"`,
      `"${getCategoryName(t.categoryId)}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_expense_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl text-slate-100 overflow-hidden my-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h2 id="report-modal-title" className="text-base font-bold text-white">
              {isBn ? 'আর্থিক বিবরণী ও এক্সপোর্ট রিপোর্ট' : 'Financial Statement & Export'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'CSV ডাউনলোড' : 'Download CSV'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রিন্ট / PDF' : 'Print / PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Content */}
        <div ref={printRef} className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs">
          
          {/* Statement Header */}
          <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white">Smart Expense BD & Global</h3>
              <p className="text-slate-400 mt-0.5">
                {isBn ? 'মাসিক সমন্বিত আর্থিক প্রতিবেদন' : 'Consolidated Monthly Statement'}
              </p>
              <p className="text-slate-500 text-[11px] mt-1">
                Generated: {new Date().toLocaleDateString()} • Base Currency: {baseCurrency}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                Official Report
              </span>
            </div>
          </div>

          {/* High level financial KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">{isBn ? 'মোট আয় (Income)' : 'Total Income'}</span>
              <span className="text-base font-bold text-emerald-400 mt-1 block">
                {formatCurrency(summary.totalIncome, baseCurrency, language)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">{isBn ? 'মোট ব্যয় (Expense)' : 'Total Expense'}</span>
              <span className="text-base font-bold text-rose-400 mt-1 block">
                {formatCurrency(summary.totalExpense, baseCurrency, language)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">{isBn ? 'নীট সঞ্চয় (Net)' : 'Net Savings'}</span>
              <span className="text-base font-bold text-white mt-1 block">
                {formatCurrency(summary.netSavings, baseCurrency, language)}
              </span>
            </div>
          </div>

          {/* Detailed Transaction Table */}
          <div>
            <h4 className="font-bold text-slate-200 mb-2">
              {isBn ? 'লেনদেনসমূহের তালিকা' : 'Transaction Log'}
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Title / Description</th>
                    <th className="py-2.5 px-3">Account / Wallet</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{t.date}</td>
                      <td className="py-2 px-3 font-medium text-white">{t.title}</td>
                      <td className="py-2 px-3">{getAccountName(t.accountId)}</td>
                      <td className="py-2 px-3 text-slate-400">{getCategoryName(t.categoryId)}</td>
                      <td className={`py-2 px-3 text-right font-bold ${
                        t.type === 'income' ? 'text-emerald-400' : t.type === 'expense' ? 'text-rose-400' : 'text-blue-400'
                      }`}>
                        {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                        {formatCurrency(t.amount, t.currency, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
