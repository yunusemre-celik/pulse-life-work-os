'use client';

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Edit2,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Transaction, RecurringTransaction } from '@/types';
import { FinancePieChart } from './FinancePieChart';
import { RecurringTransactionModal } from '@/components/modals/RecurringTransactionModal';

interface FinanceViewProps {
  onOpenAddTransaction: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onOpenAddTransaction }) => {
  const {
    state,
    deleteTransaction,
    deleteRecurringTransaction,
    toggleRecurringActive,
    processRecurringTransaction,
    checkAndProcessRecurring,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'recurring'>('ledger');
  const [filterType, setFilterType] = useState<string>('Tümü');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'current_month' | 'last_month'>('all');
  const [recurringFilter, setRecurringFilter] = useState<'all' | 'expense' | 'income'>('all');

  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurringItem, setEditingRecurringItem] = useState<RecurringTransaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Time calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonthKey = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
  const currentDay = now.getDate();

  // Last month key
  const lastMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthName = now.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const lastMonthName = lastMonthDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  // Recurring totals
  const recurringList = state.recurringTransactions || [];
  const activeRecurring = recurringList.filter((r) => r.isActive);

  const monthlyRecurringIncome = activeRecurring
    .filter((r) => r.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyRecurringExpense = activeRecurring
    .filter((r) => r.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyRecurringNet = monthlyRecurringIncome - monthlyRecurringExpense;

  // Filter transactions by period
  const periodTransactions = useMemo(() => {
    return state.transactions.filter((t) => {
      if (periodFilter === 'current_month') {
        return t.date.startsWith(currentMonthKey);
      }
      if (periodFilter === 'last_month') {
        return t.date.startsWith(lastMonthKey);
      }
      return true;
    });
  }, [state.transactions, periodFilter, currentMonthKey, lastMonthKey]);

  // Overall financial stats for the selected period
  const totalIncome = periodTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = periodTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Filtered transactions for the table
  const filteredTransactions = periodTransactions.filter((t) => {
    if (filterType === 'Tümü') return true;
    if (filterType === 'Gelirler') return t.type === 'income';
    if (filterType === 'Giderler') return t.type === 'expense';
    if (filterType === 'Düzenli') return Boolean(t.isRecurring);
    return true;
  });

  // Calculate status of each recurring transaction for the current month
  const recurringStatusList = useMemo(() => {
    return recurringList.map((r) => {
      const isProcessedThisMonth =
        r.lastProcessedMonth === currentMonthKey ||
        state.transactions.some(
          (t) => t.recurringId === r.id && t.date.startsWith(currentMonthKey) && !t.deletedAt
        );

      const day = r.dayOfMonth || 1;
      const isDue = currentDay >= day;
      const daysLeft = Math.max(0, day - currentDay);

      return {
        ...r,
        isProcessedThisMonth,
        isDue,
        daysLeft,
      };
    });
  }, [recurringList, currentMonthKey, currentDay, state.transactions]);

  // Number of active recurring items that are due this month and haven't been processed yet
  const pendingDueCount = recurringStatusList.filter(
    (r) => r.isActive && !r.isProcessedThisMonth && r.isDue
  ).length;

  // Upcoming items this month (not yet processed, sorted by closest day)
  const upcomingRecurring = useMemo(() => {
    return recurringStatusList
      .filter((r) => r.isActive && !r.isProcessedThisMonth)
      .sort((a, b) => a.dayOfMonth - b.dayOfMonth);
  }, [recurringStatusList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleProcessDueAll = () => {
    const count = checkAndProcessRecurring();
    if (count > 0) {
      showToast(`🎉 ${count} adet günü gelen düzenli işlem başarıyla cüzdana işlendi!`);
    } else {
      showToast('ℹ️ Günü gelip de henüz işlenmemiş düzenli işlem bulunmuyor.');
    }
  };

  const handleProcessSingle = (recId: string, title: string) => {
    processRecurringTransaction(recId);
    showToast(`✅ "${title}" bu ayki (${currentMonthName}) işlem geçmişine eklendi.`);
  };

  const handleOpenAddRecurring = () => {
    setEditingRecurringItem(null);
    setIsRecurringModalOpen(true);
  };

  const handleEditRecurring = (item: RecurringTransaction) => {
    setEditingRecurringItem(item);
    setIsRecurringModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold shadow-xl animate-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Finans, Bütçe & Nakit Akışı
          </h2>
          <p className="text-xs text-neutral-500">
            Tekil işlemler, aylık düzenli gelir/giderler ve abonelik takip merkezi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAddRecurring}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e5e5e3] dark:border-[#333] hover:bg-neutral-100 dark:hover:bg-[#252525] text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
            <span>Düzenli İşlem / Abonelik</span>
          </button>

          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Gelir / Gider Ekle</span>
          </button>
        </div>
      </div>

      {/* Main View Mode Selector (Sub-Tabs) */}
      <div className="flex items-center gap-2 border-b border-[#e5e5e3] dark:border-[#2a2a2a] pb-2">
        <button
          onClick={() => setActiveSubTab('ledger')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'ledger'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#252525]'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>İşlem Geçmişi & Kasa</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recurring')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeSubTab === 'recurring'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#252525]'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Aylık Düzenli Gelir & Abonelikler</span>
          {activeRecurring.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'recurring'
                  ? 'bg-neutral-700 text-white dark:bg-neutral-300 dark:text-neutral-900'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {activeRecurring.length}
            </span>
          )}
          {pendingDueCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Günü gelen işlem var" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: LEDGER & OVERVIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-6">
          {/* Monthly Recurring Overhead & Upcoming Payments Banner */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-[#2e2e2e] bg-gradient-to-r from-neutral-50 via-white to-neutral-50 dark:from-[#1c1c1c] dark:via-[#1f1f1f] dark:to-[#1c1c1c] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Aylık Sabit Düzenli Akış Özeti
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Maaş, burs ve abonelik gibi otomatik tekrarlanan aylık nakit dengesi.
                  </p>
                </div>
              </div>

              {pendingDueCount > 0 ? (
                <button
                  onClick={handleProcessDueAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all shrink-0"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Günü Gelen {pendingDueCount} Düzenli İşlemi Kaydet</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveSubTab('recurring')}
                  className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1 font-medium transition-colors self-start sm:self-auto"
                >
                  <span>Düzenli İşlemleri Yönet</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#191919] border border-[#e5e5e3] dark:border-[#2a2a2a]">
                <span className="text-[11px] text-neutral-500 block">Aylık Sabit Gelir</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  +₺{monthlyRecurringIncome.toLocaleString('tr-TR')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#191919] border border-[#e5e5e3] dark:border-[#2a2a2a]">
                <span className="text-[11px] text-neutral-500 block">Aylık Sabit Gider (Abonelikler)</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                  -₺{monthlyRecurringExpense.toLocaleString('tr-TR')}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-[#191919] border border-[#e5e5e3] dark:border-[#2a2a2a]">
                <span className="text-[11px] text-neutral-500 block">Net Sabit Kalan Bakiye</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    monthlyRecurringNet >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {monthlyRecurringNet >= 0 ? '+' : ''}₺{monthlyRecurringNet.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Upcoming recurring list preview */}
            {upcomingRecurring.length > 0 && (
              <div className="pt-2 border-t border-neutral-200/70 dark:border-neutral-800/80">
                <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1 mb-1.5">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  Bu Ay Yaklaşan Düzenli Ödemeler & Tahsilatlar:
                </span>
                <div className="flex flex-wrap gap-2">
                  {upcomingRecurring.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-white dark:bg-[#252525] border border-[#e5e5e3] dark:border-[#333]"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          r.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{r.title}</span>
                      <span className="text-neutral-400 font-mono">₺{r.amount.toLocaleString('tr-TR')}</span>
                      <span className="text-[10px] text-neutral-500">
                        ({r.isDue ? 'Bugün/Günü Geldi' : `${r.daysLeft} gün kaldı`})
                      </span>
                      {r.isDue && (
                        <button
                          onClick={() => handleProcessSingle(r.id, r.title)}
                          className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold transition-colors"
                        >
                          İşle
                        </button>
                      )}
                    </div>
                  ))}
                  {upcomingRecurring.length > 4 && (
                    <button
                      onClick={() => setActiveSubTab('recurring')}
                      className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium px-2 py-1"
                    >
                      +{upcomingRecurring.length - 4} daha fazla...
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Period Filter Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Kasa Durumu & Hareketler
            </span>

            <div className="flex items-center gap-1.5 bg-[#f0f0ee] dark:bg-[#252525] p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setPeriodFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  periodFilter === 'all'
                    ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Tüm Zamanlar
              </button>
              <button
                onClick={() => setPeriodFilter('current_month')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  periodFilter === 'current_month'
                    ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Bu Ay ({currentMonthName})
              </button>
              <button
                onClick={() => setPeriodFilter('last_month')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  periodFilter === 'last_month'
                    ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Geçen Ay ({lastMonthName})
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Gelir */}
            <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">
                  {periodFilter === 'all' ? 'Toplam Gelir' : `${currentMonthName} Geliri`}
                </span>
                <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ₺{totalIncome.toLocaleString('tr-TR')}
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Tasarım, freelance ve burslar</p>
              </div>
            </div>

            {/* Gider */}
            <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">
                  {periodFilter === 'all' ? 'Toplam Gider' : `${currentMonthName} Gideri`}
                </span>
                <div className="p-1 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                  ₺{totalExpense.toLocaleString('tr-TR')}
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Abonelik, araçlar ve yaşam</p>
              </div>
            </div>

            {/* Net Kasa */}
            <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Net Kasa / Fark</span>
                <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`text-2xl font-bold font-mono ${
                    netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                  }`}
                >
                  {netBalance >= 0 ? '+' : ''}₺{netBalance.toLocaleString('tr-TR')}
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Tasarruf oranı: %{totalIncome > 0 ? Math.round((netBalance / totalIncome) * 100) : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Pie Chart */}
          <FinancePieChart transactions={periodTransactions} />

          {/* Transactions Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                İşlem Geçmişi ({filteredTransactions.length})
              </h3>

              <div className="flex items-center gap-1.5">
                {['Tümü', 'Gelirler', 'Giderler', 'Düzenli'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      filterType === f
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                        : 'text-neutral-500 hover:bg-[#f2f2f0] dark:hover:bg-[#252525]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-xs overflow-hidden divide-y divide-[#f0f0ee] dark:divide-[#2a2a2a]">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400 space-y-1">
                  <p>Bu filtreye uygun işlem kaydı bulunamadı.</p>
                  <p className="text-[11px] text-neutral-500">
                    Yukarıdaki butonlarla yeni gelir veya gider ekleyebilirsiniz.
                  </p>
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 flex items-center justify-between hover:bg-[#fafafa] dark:hover:bg-[#242424] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {tx.title}
                          </h4>
                          {tx.isRecurring && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                              <RefreshCw className="w-2.5 h-2.5" />
                              Düzenli
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
                          <span>{tx.category}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                          {tx.notes && (
                            <>
                              <span>•</span>
                              <span className="italic truncate max-w-[200px]">{tx.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-bold font-mono ${
                          tx.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-neutral-900 dark:text-neutral-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}₺{tx.amount.toLocaleString('tr-TR')}
                      </span>
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1 text-neutral-400 hover:text-rose-500 transition-colors"
                        title="İşlemi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: RECURRING TRANSACTIONS & SUBSCRIPTIONS */}
      {/* ========================================================================= */}
      {activeSubTab === 'recurring' && (
        <div className="space-y-6">
          {/* Recurring Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Düzenli Aylık Gelir</span>
                <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ₺{monthlyRecurringIncome.toLocaleString('tr-TR')}
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {activeRecurring.filter((r) => r.type === 'income').length} aktif düzenli gelir
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Düzenli Aylık Gider (Abonelikler)</span>
                <div className="p-1 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                  ₺{monthlyRecurringExpense.toLocaleString('tr-TR')}
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {activeRecurring.filter((r) => r.type === 'expense').length} aktif abonelik / sabit gider
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500">Net Düzenli Kasa Farkı</span>
                <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`text-2xl font-bold font-mono ${
                    monthlyRecurringNet >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {monthlyRecurringNet >= 0 ? '+' : ''}₺{monthlyRecurringNet.toLocaleString('tr-TR')}
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5">Sabit yükler sonrası kalan serbest nakit</p>
              </div>
            </div>
          </div>

          {/* List Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Kayıtlı Düzenli İşlemler & Abonelikler ({recurringList.length})
              </span>
              {pendingDueCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  {pendingDueCount} işlem bu ay işlenmeyi bekliyor
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-[#f0f0ee] dark:bg-[#252525] p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setRecurringFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    recurringFilter === 'all'
                      ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setRecurringFilter('expense')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    recurringFilter === 'expense'
                      ? 'bg-white dark:bg-[#1a1a1a] text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Abonelik / Gider
                </button>
                <button
                  onClick={() => setRecurringFilter('income')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    recurringFilter === 'income'
                      ? 'bg-white dark:bg-[#1a1a1a] text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Sabit Gelir
                </button>
              </div>

              <button
                onClick={handleOpenAddRecurring}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium shadow-xs transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Yeni Ekle</span>
              </button>
            </div>
          </div>

          {/* Recurring List */}
          {recurringStatusList.length === 0 ? (
            <div className="p-10 rounded-2xl border border-dashed border-[#e5e5e3] dark:border-[#2a2a2a] bg-neutral-50/50 dark:bg-[#1a1a1a]/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 mx-auto flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Henüz düzenli bir gelir veya gider kaydetmediniz
                </h4>
                <p className="text-xs text-neutral-500">
                  Her ay düzenli ödenen Spotify, Netflix, ChatGPT abonelikleriniz, ev kiranız ya da KYK bursu gibi düzenli gelirlerinizi ekleyerek aylık bütçenizi otomatikleştirin.
                </p>
              </div>
              <button
                onClick={handleOpenAddRecurring}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>İlk Düzenli İşlemini Tanımla</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {recurringStatusList
                .filter((r) => {
                  if (recurringFilter === 'expense') return r.type === 'expense';
                  if (recurringFilter === 'income') return r.type === 'income';
                  return true;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.isActive
                        ? 'border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-xs hover:border-neutral-400 dark:hover:border-neutral-600'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#181818]/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            item.type === 'income'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {item.type === 'income' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                              {item.title}
                            </h4>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                item.isActive
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                  : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                              }`}
                            >
                              {item.isActive ? 'Aktif' : 'Duraklatıldı'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300 font-medium">
                              <Calendar className="w-3 h-3 text-neutral-400" />
                              Her ayın {item.dayOfMonth}. günü
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-bold font-mono block ${
                            item.type === 'income'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          {item.type === 'income' ? '+' : '-'}₺{item.amount.toLocaleString('tr-TR')}
                        </span>
                        <span className="text-[10px] text-neutral-400">/ ay</span>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-neutral-500 italic mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                        {item.notes}
                      </p>
                    )}

                    {/* Bottom Status & Actions Bar */}
                    <div className="mt-3.5 pt-3 border-t border-[#f0f0ee] dark:border-[#2a2a2a] flex items-center justify-between text-xs">
                      {/* Current Month Status Badge */}
                      <div>
                        {item.isProcessedThisMonth ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            Bu ay işlendi ({currentMonthName})
                          </span>
                        ) : item.isDue ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                              <AlertCircle className="w-3 h-3" />
                              Günü Geldi
                            </span>
                            <button
                              onClick={() => handleProcessSingle(item.id, item.title)}
                              className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-all shadow-2xs"
                            >
                              Bu Ayı İşle
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            {item.daysLeft} gün sonra işlenecek
                          </span>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleRecurringActive(item.id)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            item.isActive
                              ? 'text-neutral-400 hover:text-amber-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                              : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                          }`}
                          title={item.isActive ? 'Duraklat' : 'Aktifleştir'}
                        >
                          {item.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleEditRecurring(item)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteRecurringTransaction(item.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Recurring Transaction Add/Edit Modal */}
      <RecurringTransactionModal
        isOpen={isRecurringModalOpen}
        onClose={() => {
          setIsRecurringModalOpen(false);
          setEditingRecurringItem(null);
        }}
        editingItem={editingRecurringItem}
      />
    </div>
  );
};
