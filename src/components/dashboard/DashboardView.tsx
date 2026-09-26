'use client';

import React, { useState } from 'react';
import {
  Code2,
  Palette,
  GraduationCap,
  Wallet,
  CheckCircle2,
  Circle,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MainCategory, Priority } from '@/types';

interface DashboardViewProps {
  onOpenQuickAdd: (type?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenQuickAdd }) => {
  const {
    state,
    setActiveTab,
    toggleFocusTask,
    addFocusTask,
    deleteFocusTask,
    toggleAcademicTask,
  } = useApp();

  // Quick task input state
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskCategory, setQuickTaskCategory] = useState<MainCategory>('personal');
  const [quickTaskPriority, setQuickTaskPriority] = useState<Priority>('medium');

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addFocusTask({
      title: quickTaskTitle.trim(),
      completed: false,
      priority: quickTaskPriority,
      category: quickTaskCategory,
      dueDate: new Date().toISOString().split('T')[0],
    });
    setQuickTaskTitle('');
  };

  // Metrics calculation
  const totalIncome = state.transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const pendingReceivables = state.clientOrders
    .filter((o) => o.status !== 'Teslim Edildi')
    .reduce((acc, curr) => acc + (curr.price - curr.paidAmount), 0);

  const activeOrdersCount = state.clientOrders.filter((o) => o.status !== 'Teslim Edildi').length;
  const activeProjectsCount = state.projects.filter((p) => p.status === 'Geliştirmede').length;
  const upcomingAcadCount = state.academicTasks.filter((t) => !t.isCompleted).length;

  // Category tags format
  const categoryLabels: Record<MainCategory, { label: string; color: string }> = {
    dev: { label: 'Yazılım', color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900' },
    school: { label: 'Okul', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900' },
    design: { label: 'Tasarım', color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900' },
    content: { label: 'İçerik', color: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900' },
    finance: { label: 'Finans', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' },
    personal: { label: 'Kişisel', color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700' },
  };

  const priorityDots: Record<Priority, string> = {
    high: 'text-rose-500 fill-rose-500',
    medium: 'text-amber-500 fill-amber-500',
    low: 'text-emerald-500 fill-emerald-500',
  };

  // Helper for days remaining
  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <span>Günün Özeti</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            Odak Modu
          </span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Bugün ilgilenmen gereken öncelikli işler, müşteri siparişleri ve yaklaşan akademik teslimler.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Yazılım */}
        <div
          onClick={() => setActiveTab('projects')}
          className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Yazılım Projeleri</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {state.projects.length}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5">
              {activeProjectsCount} aktif geliştirmede <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Tasarım */}
        <div
          onClick={() => setActiveTab('clients')}
          className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Müşteri Tasarımları</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Palette className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {activeOrdersCount} Sipariş
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              ₺{pendingReceivables.toLocaleString('tr-TR')} bekleyen alacak
            </span>
          </div>
        </div>

        {/* Okul */}
        <div
          onClick={() => setActiveTab('school')}
          className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Akademik Takvim</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {upcomingAcadCount} Teslim
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Vize & Ödevler
            </span>
          </div>
        </div>

        {/* Finans */}
        <div
          onClick={() => setActiveTab('finance')}
          className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Net Kâr / Bakiye</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={`text-2xl font-bold ${
                netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
              }`}
            >
              {netBalance >= 0 ? '+' : ''}₺{netBalance.toLocaleString('tr-TR')}
            </span>
            <span className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> +₺{totalIncome.toLocaleString('tr-TR')} gelir
            </span>
          </div>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Priorities + Quick Task Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Task Board */}
          <div className="p-5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Bugünün Öncelikli Görevleri
                </h3>
                <span className="text-xs font-medium text-neutral-400">
                  ({state.focusTasks.filter((t) => t.completed).length}/{state.focusTasks.length})
                </span>
              </div>
              <button
                onClick={() => onOpenQuickAdd('focus_task')}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Detaylı Ekle
              </button>
            </div>

            {/* Quick Inline Input */}
            <form onSubmit={handleAddQuickTask} className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-1 pb-2">
              <input
                type="text"
                placeholder="Yeni bir görev yazın ve Enter'a basın..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="flex-1 min-w-[200px] text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500"
              />
              <select
                value={quickTaskCategory}
                onChange={(e) => setQuickTaskCategory(e.target.value as MainCategory)}
                className="text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-700 dark:text-neutral-300 focus:outline-none"
              >
                <option value="personal">Kişisel</option>
                <option value="dev">Yazılım</option>
                <option value="school">Okul</option>
                <option value="design">Tasarım</option>
                <option value="content">İçerik</option>
              </select>
              <select
                value={quickTaskPriority}
                onChange={(e) => setQuickTaskPriority(e.target.value as Priority)}
                className="text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-700 dark:text-neutral-300 focus:outline-none"
              >
                <option value="high">🔴 Yüksek</option>
                <option value="medium">🟡 Orta</option>
                <option value="low">🟢 Düşük</option>
              </select>
              <button
                type="submit"
                className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-medium rounded-lg transition-colors shrink-0"
              >
                Ekle
              </button>
            </form>

            {/* Tasks List */}
            <div className="divide-y divide-[#f0f0ee] dark:divide-[#292929]">
              {state.focusTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  Henüz bir görev eklenmedi. Yukarıdaki alandan hemen ekleyin!
                </div>
              ) : (
                state.focusTasks.map((task) => {
                  const cat = categoryLabels[task.category] || categoryLabels.personal;
                  return (
                    <div
                      key={task.id}
                      className="py-2.5 flex items-center justify-between group hover:bg-[#fafaf8] dark:hover:bg-[#242424] px-2 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleFocusTask(task.id)}
                          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-300 dark:text-neutral-600 hover:text-neutral-500" />
                          )}
                        </button>
                        <span
                          className={`text-xs text-neutral-800 dark:text-neutral-200 truncate ${
                            task.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border font-medium ${cat.color}`}
                        >
                          {cat.label}
                        </span>
                        {task.dueDate && (
                          <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {task.dueDate.slice(5)}
                          </span>
                        )}
                        <button
                          onClick={() => deleteFocusTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-500 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Client Design Orders */}
          <div className="p-5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Müşteri Tasarım İşleri & Aşama Durumu
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('clients')}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                Tümünü Gör <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.clientOrders.slice(0, 4).map((order) => {
                const daysLeft = getDaysDiff(order.deliveryDate);
                return (
                  <div
                    key={order.id}
                    className="p-3 rounded-lg border border-[#e8e8e6] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#252525] flex flex-col justify-between space-y-2.5"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {order.clientName}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 line-clamp-1">
                        {order.projectTitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-[#eaeaea] dark:border-[#2f2f2f]">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        ₺{order.price.toLocaleString('tr-TR')}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          daysLeft <= 2
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {daysLeft < 0 ? 'Gecikti' : daysLeft === 0 ? 'Bugün Teslim' : `${daysLeft} gün kaldı`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Academic Deadlines & Content Pipeline */}
        <div className="space-y-6">
          {/* Academic Deadlines */}
          <div className="p-5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Yaklaşan Sınav & Ödevler
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('school')}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center"
              >
                Dersler <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {state.academicTasks.filter((t) => !t.isCompleted).length === 0 ? (
                <div className="py-4 text-center text-xs text-neutral-400">
                  Bekleyen sınav veya ödev bulunmuyor. Harika!
                </div>
              ) : (
                state.academicTasks
                  .filter((t) => !t.isCompleted)
                  .slice(0, 4)
                  .map((task) => {
                    const daysLeft = getDaysDiff(task.dueDate);
                    return (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-lg border border-[#e8e8e6] dark:border-[#2d2d2d] bg-[#fafafa] dark:bg-[#252525] flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block truncate">
                            {task.courseName}
                          </span>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200 block truncate">
                            {task.title}
                          </span>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              daysLeft <= 3
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {daysLeft === 0 ? 'Bugün' : `${daysLeft} gün`}
                          </span>
                          <button
                            onClick={() => toggleAcademicTask(task.id)}
                            title="Tamamlandı olarak işaretle"
                            className="text-neutral-400 hover:text-emerald-500"
                          >
                            <Circle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Social Media Content Queue */}
          <div className="p-5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  İçerik Stüdyosu
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('content')}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center"
              >
                Hepsini Gör <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {state.contentItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-[#e8e8e6] dark:border-[#2d2d2d] bg-[#fafafa] dark:bg-[#252525] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {item.platform}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {item.status}
                    </span>
                  </div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-200 line-clamp-1">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Pinned Note */}
          {state.notes.find((n) => n.isPinned) && (
            <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-[#fffdf5] dark:bg-[#22211c] border-amber-200/60 dark:border-amber-900/40 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-semibold text-[11px]">
                <span>📌 {state.notes.find((n) => n.isPinned)?.title}</span>
                <button onClick={() => setActiveTab('notes')} className="hover:underline">
                  Notlara Git
                </button>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px] whitespace-pre-line line-clamp-3">
                {state.notes.find((n) => n.isPinned)?.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
