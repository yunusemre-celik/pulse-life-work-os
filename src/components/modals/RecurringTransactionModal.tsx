'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ArrowDownLeft, ArrowUpRight, Calendar, DollarSign, Tag, Check, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RecurringTransaction, Transaction } from '@/types';

interface RecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: RecurringTransaction | null;
}

const CATEGORIES: Transaction['category'][] = [
  'Tasarım Geliri',
  'Freelance Yazılım',
  'Burs / Harçlık',
  'Diğer Gelir',
  'Yazılım & Abonelik',
  'Okul & Eğitim',
  'Tasarım Kaynakları',
  'Kişisel Yaşam',
];

export const RecurringTransactionModal: React.FC<RecurringTransactionModalProps> = ({
  isOpen,
  onClose,
  editingItem,
}) => {
  const { addRecurringTransaction, updateRecurringTransaction } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<number | string>(100);
  const [category, setCategory] = useState<Transaction['category']>('Yazılım & Abonelik');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [frequency, setFrequency] = useState<'monthly' | 'yearly' | 'weekly'>('monthly');
  const [autoProcess, setAutoProcess] = useState<boolean>(true);
  const [notes, setNotes] = useState('');
  const [processThisMonthNow, setProcessThisMonthNow] = useState<boolean>(true);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setType(editingItem.type);
      setAmount(editingItem.amount);
      setCategory(editingItem.category);
      setDayOfMonth(editingItem.dayOfMonth || 1);
      setFrequency(editingItem.frequency || 'monthly');
      setAutoProcess(editingItem.autoProcess !== false);
      setNotes(editingItem.notes || '');
      setProcessThisMonthNow(false);
    } else {
      setTitle('');
      setType('expense');
      setAmount(100);
      setCategory('Yazılım & Abonelik');
      setDayOfMonth(new Date().getDate());
      setFrequency('monthly');
      setAutoProcess(true);
      setNotes('');
      setProcessThisMonthNow(true);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const numericAmount = Math.max(0, Number(amount) || 0);

    if (editingItem) {
      updateRecurringTransaction({
        ...editingItem,
        title: title.trim(),
        type,
        amount: numericAmount,
        category,
        dayOfMonth: Math.min(31, Math.max(1, dayOfMonth)),
        frequency,
        autoProcess,
        notes: notes.trim() || undefined,
      });
    } else {
      addRecurringTransaction(
        {
          title: title.trim(),
          type,
          amount: numericAmount,
          category,
          dayOfMonth: Math.min(31, Math.max(1, dayOfMonth)),
          frequency,
          startDate: new Date().toISOString().split('T')[0],
          isActive: true,
          autoProcess,
          notes: notes.trim() || undefined,
        },
        processThisMonthNow
      );
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e5e5e3] dark:border-[#2e2e2e] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0ee] dark:border-[#2a2a2a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {editingItem ? 'Düzenli İşlemi Güncelle' : 'Yeni Düzenli İşlem / Abonelik'}
              </h3>
              <p className="text-[11px] text-neutral-500">
                Her ay düzenli tekrarlanan gelir, gider veya aboneliklerinizi tanımlayın.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Income vs Expense Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              İşlem Türü
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  if (category === 'Yazılım & Abonelik' || category === 'Tasarım Kaynakları') {
                    setCategory('Tasarım Geliri');
                  }
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                    : 'border-[#e5e5e3] dark:border-[#333] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#252525]'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>+ Düzenli Gelir (Maaş / Burs)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  if (category === 'Tasarım Geliri' || category === 'Freelance Yazılım') {
                    setCategory('Yazılım & Abonelik');
                  }
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs'
                    : 'border-[#e5e5e3] dark:border-[#333] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#252525]'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>- Düzenli Gider (Abonelik / Kira)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Başlık / Açıklama *
            </label>
            <input
              type="text"
              required
              placeholder={type === 'expense' ? 'Örn: Spotify Aile, ChatGPT Plus, Ev Kirası' : 'Örn: KYK Bursu, Düzenli Müşteri Retainer'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#e5e5e3] dark:border-[#333] bg-[#fafafa] dark:bg-[#222] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              autoFocus
            />
          </div>

          {/* Amount & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Aylık Tutar (₺) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs pl-7 pr-3 py-2 rounded-xl border border-[#e5e5e3] dark:border-[#333] bg-[#fafafa] dark:bg-[#222] text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-medium">₺</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Transaction['category'])}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#e5e5e3] dark:border-[#333] bg-[#fafafa] dark:bg-[#222] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Day of Month & Frequency */}
          <div className="p-3.5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-[#fafafa] dark:bg-[#202020] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                Tekrarlama Günü
              </span>
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">
                Her ayın {dayOfMonth}. günü
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-neutral-100"
              />
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                className="w-14 text-center text-xs py-1 rounded-lg border border-[#e5e5e3] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 font-mono"
              />
            </div>

            <div className="flex gap-1.5 pt-1">
              {[1, 5, 10, 15, 20, 25, 30].map((quickDay) => (
                <button
                  key={quickDay}
                  type="button"
                  onClick={() => setDayOfMonth(quickDay)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-all ${
                    dayOfMonth === quickDay
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                      : 'bg-white dark:bg-[#1a1a1a] border border-[#e5e5e3] dark:border-[#333] text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                  }`}
                >
                  Ayın {quickDay}&apos;i
                </button>
              ))}
            </div>
          </div>

          {/* Auto-process Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#202020]">
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 block">
                Otomatik Kaydet
              </span>
              <span className="text-[11px] text-neutral-500 block">
                Günü geldiğinde otomatik olarak harcamalara/gelirlere işlensin.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
              <input
                type="checkbox"
                checked={autoProcess}
                onChange={(e) => setAutoProcess(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900 dark:peer-checked:bg-neutral-100 dark:peer-checked:after:bg-neutral-900"></div>
            </label>
          </div>

          {/* Process This Month Immediately (Only for new items) */}
          {!editingItem && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-blue-950 dark:text-blue-200 block">
                    Bu ayın işlemini de şimdi kaydet
                  </span>
                  <span className="text-[11px] text-blue-700/80 dark:text-blue-300/80 block">
                    Mevcut ay için bu işlemi anında gelir/gider listesine ekler.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={processThisMonthNow}
                onChange={(e) => setProcessThisMonthNow(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400 h-4 w-4 ml-3"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Notlar (İsteğe bağlı)
            </label>
            <input
              type="text"
              placeholder="Örn: Garanti kartından çekiliyor, yıllık yenileme kasımda"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#e5e5e3] dark:border-[#333] bg-[#fafafa] dark:bg-[#222] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f0ee] dark:border-[#2a2a2a]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{editingItem ? 'Değişiklikleri Kaydet' : 'Düzenli İşlemi Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
