import React, { useState, useEffect } from 'react';
import { 
  Account, 
  Category, 
  CurrencyCode, 
  Language, 
  Transaction 
} from '../types';
import { CURRENCIES } from '../data/initialData';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Receipt, 
  Upload, 
  CheckCircle,
  HelpCircle,
  Percent
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id'>) => void;
  accounts: Account[];
  categories: Category[];
  language: Language;
  baseCurrency: CurrencyCode;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  categories,
  language,
  baseCurrency,
}) => {
  const isBn = language === 'bn';

  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>(baseCurrency);
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [targetAccountId, setTargetAccountId] = useState<string>(accounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [transferFee, setTransferFee] = useState<string>('0');
  const [receiptName, setReceiptName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync currency with base when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrency(baseCurrency);
      setErrorMessage('');
    }
  }, [isOpen, baseCurrency]);

  // Set default category when type changes
  useEffect(() => {
    const validCategories = categories.filter((c) => c.type === (type === 'transfer' ? 'expense' : type));
    if (validCategories.length > 0) {
      setCategoryId(validCategories[0].id);
    }
  }, [type, categories]);

  if (!isOpen) return null;

  const validCategories = categories.filter(
    (c) => type === 'transfer' || c.type === type
  );

  const handleApplyBkashFee = (percentage: number) => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      const fee = Math.round((numAmount * (percentage / 100)) * 100) / 100;
      setTransferFee(String(fee));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে সঠিক টাকার পরিমাণ দিন।' : 'Please enter a valid positive amount.');
      return;
    }

    if (!accountId) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে ওয়ালেট বা অ্যাকাউন্ট নির্বাচন করুন।' : 'Please select a source account/wallet.');
      return;
    }

    if (type === 'transfer' && accountId === targetAccountId) {
      setErrorMessage(isBn ? 'একই অ্যাকাউন্টে ফান্ড ট্রান্সফার সম্ভব নয়।' : 'Source and destination accounts must be different.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে লেনদেনের শিরোনাম লিখুন।' : 'Please enter a title or description.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      amount: parsedAmount,
      currency,
      accountId,
      targetAccountId: type === 'transfer' ? targetAccountId : undefined,
      categoryId: type === 'transfer' ? 'cat_transfer' : categoryId,
      title: title.trim(),
      merchant: merchant.trim() || undefined,
      note: note.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      transferFee: type === 'transfer' ? parseFloat(transferFee) || 0 : undefined,
      receiptName: receiptName || undefined,
    });

    // Reset & close
    setAmount('');
    setTitle('');
    setMerchant('');
    setNote('');
    setTagsInput('');
    setTransferFee('0');
    setReceiptName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl text-slate-100 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <h2 id="modal-title" className="text-lg font-bold text-white flex items-center gap-2">
            <span>{isBn ? 'লেনদেন যোগ করুন' : 'Add New Transaction'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Type Tabs */}
        <div className="p-6 pb-0">
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isBn ? 'ব্যয় (Expense)' : 'Expense'}</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{isBn ? 'আয় (Income)' : 'Income'}</span>
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>{isBn ? 'ট্রান্সফার' : 'Transfer'}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Amount and Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'পরিমাণ (Amount) *' : 'Amount *'}
              </label>
              <div className="relative">
                <input
                  id="tx-amount"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tx-currency" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'মুদ্রা' : 'Currency'}
              </label>
              <select
                id="tx-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-3 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title and Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="tx-title" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'বিবরণ / শিরোনাম *' : 'Title / Description *'}
              </label>
              <input
                id="tx-title"
                type="text"
                placeholder={isBn ? 'যেমন: বাজার খরচ, ইন্টারনেট বিল' : 'e.g. Shwapno Groceries, Freelance'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="tx-merchant" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'প্রতিষ্ঠান / প্রাপক (ঐচ্ছিক)' : 'Merchant / Payee (Optional)'}
              </label>
              <input
                id="tx-merchant"
                type="text"
                placeholder={isBn ? 'যেমন: DESCO, স্বপ্ন, পাঠাও' : 'e.g. DESCO, Netflix, Pathao'}
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Accounts selection */}
          {type !== 'transfer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="tx-account" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isBn ? 'অ্যাকাউন্ট / ওয়ালেট *' : 'Account / Wallet *'}
                </label>
                <select
                  id="tx-account"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {isBn ? acc.nameBn : acc.name} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tx-category" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isBn ? 'ক্যাটাগরি *' : 'Category *'}
                </label>
                <select
                  id="tx-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {validCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isBn ? c.nameBn : c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Transfer fields */
            <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="tx-from-account" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isBn ? 'উৎস অ্যাকাউন্ট (From)' : 'From Account'}
                  </label>
                  <select
                    id="tx-from-account"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {isBn ? acc.nameBn : acc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tx-to-account" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isBn ? 'গন্তব্য অ্যাকাউন্ট (To)' : 'To Account'}
                  </label>
                  <select
                    id="tx-to-account"
                    value={targetAccountId}
                    onChange={(e) => setTargetAccountId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {isBn ? acc.nameBn : acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transfer / Cashout Fee Helper */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="tx-transfer-fee" className="text-xs font-semibold text-slate-300">
                    {isBn ? 'ক্যাশআউট চার্জ বা ফি (৳)' : 'Transfer / Cashout Fee'}
                  </label>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>{isBn ? 'চার্জ শর্টকাট:' : 'Quick Fee:'}</span>
                    <button
                      type="button"
                      onClick={() => handleApplyBkashFee(1.49)}
                      className="px-1.5 py-0.5 rounded bg-pink-950/70 text-pink-300 hover:bg-pink-900 border border-pink-700/50"
                      title="bKash App 1.49%"
                    >
                      bKash 1.49%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyBkashFee(1.85)}
                      className="px-1.5 py-0.5 rounded bg-pink-950/70 text-pink-300 hover:bg-pink-900 border border-pink-700/50"
                      title="Agent USSD 1.85%"
                    >
                      bKash 1.85%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyBkashFee(0.99)}
                      className="px-1.5 py-0.5 rounded bg-orange-950/70 text-orange-300 hover:bg-orange-900 border border-orange-700/50"
                      title="Nagad App 0.99%"
                    >
                      Nagad 0.99%
                    </button>
                  </div>
                </div>
                <input
                  id="tx-transfer-fee"
                  type="number"
                  step="any"
                  value={transferFee}
                  onChange={(e) => setTransferFee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Date & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'তারিখ' : 'Date'}
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label htmlFor="tx-tags" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'ট্যাগসমূহ (কমা দিয়ে লিখুন)' : 'Tags (comma separated)'}
              </label>
              <input
                id="tx-tags"
                type="text"
                placeholder={isBn ? 'যেমন: বাসা, ডিপিএস, শপিং' : 'e.g. food, bill, office'}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes and Receipt simulated upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="tx-note" className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'নোট / অতিরিক্ত তথ্য' : 'Notes (Optional)'}
              </label>
              <input
                id="tx-note"
                type="text"
                placeholder={isBn ? 'টোকেন নাম্বার বা রেফারেন্স' : 'Token number or reference'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'রসিদ / ভাউচার সংযুক্তি' : 'Attach Receipt / Voucher'}
              </label>
              <div className="flex items-center gap-2">
                <label 
                  htmlFor="receipt-upload"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">{receiptName ? receiptName : (isBn ? 'ফাইল নির্বাচন করুন' : 'Attach file')}</span>
                </label>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceiptName(e.target.files[0].name);
                    }
                  }}
                />
                {receiptName && (
                  <button
                    type="button"
                    onClick={() => setReceiptName('')}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isBn ? 'সংরক্ষণ করুন' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
