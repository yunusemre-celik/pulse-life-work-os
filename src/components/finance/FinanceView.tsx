'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Trash2,
  PieChart,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Transaction } from '@/types';
import { FinancePieChart } from './FinancePieChart';

interface FinanceViewProps {
  onOpenAddTransaction: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onOpenAddTransaction }) => {
  const { state, deleteTransaction } = useApp();
  const [filterType, setFilterType] = useState<string>('Tümü');

  const totalIncome = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const filteredTransactions = state.transactions.filter((t) => {
    if (filterType === 'Tümü') return true;
    if (filterType === 'Gelirler') return t.type === 'income';
    if (filterType === 'Giderler') return t.type === 'expense';
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Finans, Bütçe & Gelir/Gider Takibi
          </h2>
          <p className="text-xs text-neutral-500">
            Müşteri tasarım ödemeleri, yazılım araç abonelikleri ve aylık net nakit akışı.
          </p>
        </div>

        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium shadow-sm transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Gelir / Gider Ekle</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Gelir */}
        <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Toplam Gelir</span>
            <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₺{totalIncome.toLocaleString('tr-TR')}
            </span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Tasarım & freelance tahsilatları</p>
          </div>
        </div>

        {/* Gider */}
        <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Toplam Gider</span>
            <div className="p-1 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ₺{totalExpense.toLocaleString('tr-TR')}
            </span>
            <p className="text-[11px] text-neutral-400 mt-0.5">Yazılım, abonelik ve okul</p>
          </div>
        </div>

        {/* Net Kâr */}
        <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Net Kasa / Kâr</span>
            <div className="p-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span
              className={`text-2xl font-bold ${
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

      {/* Interactive Pie Chart (Dağılım Grafiği) */}
      <FinancePieChart transactions={state.transactions} />

      {/* Transactions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Son İşlem Geçmişi
          </h3>

          <div className="flex items-center gap-1.5">
            {['Tümü', 'Gelirler', 'Giderler'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterType === f
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:bg-[#f2f2f0] dark:hover:bg-[#252525]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm overflow-hidden divide-y divide-[#f0f0ee] dark:divide-[#2a2a2a]">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">İşlem kaydı bulunamadı.</div>
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
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
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
  );
};
