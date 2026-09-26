'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types';

interface FinancePieChartProps {
  transactions: Transaction[];
}

interface SliceData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

const COLOR_PALETTE = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#84cc16', // Lime
  '#64748b', // Slate
];

export const FinancePieChart: React.FC<FinancePieChartProps> = ({ transactions }) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const filtered = transactions.filter((t) => t.type === activeTab);
  const totalAmount = filtered.reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  filtered.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const categories = Object.keys(categoryTotals).sort(
    (a, b) => categoryTotals[b] - categoryTotals[a]
  );

  // Calculate slices for SVG donut chart (radius = 50, circumference = 2 * PI * 50 ≈ 314.159)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const slices: SliceData[] = categories.map((cat, idx) => {
    const amount = categoryTotals[cat];
    const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
    const strokeLength = (percentage / 100) * circumference;
    const dashArray = `${strokeLength} ${circumference - strokeLength}`;
    const dashOffset = -accumulatedOffset;
    accumulatedOffset += strokeLength;

    return {
      category: cat,
      amount,
      percentage,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      dashArray,
      dashOffset,
    };
  });

  const activeSlice = hoveredCategory
    ? slices.find((s) => s.category === hoveredCategory)
    : null;

  return (
    <div className="p-5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm space-y-5">
      {/* Header and Type Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Dağılım Grafiği (Pie Chart)
          </h3>
          <p className="text-[11px] text-neutral-500">
            Kategori bazlı yüzde ve harcama/gelir analizi.
          </p>
        </div>

        <div className="flex p-0.5 rounded-lg bg-[#f0f0ee] dark:bg-[#282828] text-xs font-medium">
          <button
            onClick={() => {
              setActiveTab('expense');
              setHoveredCategory(null);
            }}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'expense'
                ? 'bg-white dark:bg-[#1a1a1a] text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Giderler
          </button>
          <button
            onClick={() => {
              setActiveTab('income');
              setHoveredCategory(null);
            }}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'income'
                ? 'bg-white dark:bg-[#1a1a1a] text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Gelirler
          </button>
        </div>
      </div>

      {slices.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-400 border border-dashed border-[#e5e5e3] dark:border-[#2a2a2a] rounded-xl">
          Bu kategoride henüz bir işlem kaydı bulunmuyor.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-around gap-6 pt-2">
          {/* SVG Donut Chart */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg
              className="w-full h-full -rotate-90 transform"
              viewBox="0 0 130 130"
            >
              {/* Background circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-neutral-100 dark:stroke-[#292929]"
                strokeWidth="18"
                fill="none"
              />

              {/* Slices */}
              {slices.map((slice) => {
                const isHovered = hoveredCategory === slice.category;
                return (
                  <circle
                    key={slice.category}
                    cx="65"
                    cy="65"
                    r={radius}
                    stroke={slice.color}
                    strokeWidth={isHovered ? 22 : 18}
                    strokeDasharray={slice.dashArray}
                    strokeDashoffset={slice.dashOffset}
                    strokeLinecap="butt"
                    fill="none"
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(slice.category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Center Info Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-2">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 truncate max-w-[90px]">
                {activeSlice ? activeSlice.category : activeTab === 'expense' ? 'Toplam Gider' : 'Toplam Gelir'}
              </span>
              <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                ₺{(activeSlice ? activeSlice.amount : totalAmount).toLocaleString('tr-TR')}
              </span>
              {activeSlice && (
                <span className="text-[10px] font-bold text-neutral-500">
                  %{activeSlice.percentage.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Color Legend with Percentages */}
          <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
            {slices.map((slice) => {
              const isHovered = hoveredCategory === slice.category;
              return (
                <div
                  key={slice.category}
                  onMouseEnter={() => setHoveredCategory(slice.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`p-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isHovered
                      ? 'bg-neutral-100 dark:bg-[#282828] font-bold'
                      : 'hover:bg-neutral-50 dark:hover:bg-[#242424]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-neutral-800 dark:text-neutral-200 truncate">
                      {slice.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-neutral-500 font-mono text-[11px]">
                      %{slice.percentage.toFixed(1)}
                    </span>
                    <span className="font-semibold font-mono text-neutral-900 dark:text-neutral-100">
                      ₺{slice.amount.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
