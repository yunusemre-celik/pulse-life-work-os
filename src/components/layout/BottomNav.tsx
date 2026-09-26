'use client';

import React from 'react';
import {
  LayoutDashboard,
  Code2,
  GraduationCap,
  Palette,
  Video,
  Wallet,
  FileText,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, state } = useApp();

  // Badges
  const pendingFocusTasks = state.focusTasks.filter((t) => !t.completed).length;
  const activeProjects = state.projects.filter((p) => p.status === 'Geliştirmede').length;
  const pendingAcadTasks = state.academicTasks.filter((t) => !t.isCompleted).length;
  const activeOrders = state.clientOrders.filter((o) => o.status !== 'Teslim Edildi').length;
  const activeContent = state.contentItems.filter((c) => c.status !== 'Yayınlandı').length;

  // Exactly 7 tabs
  const tabs = [
    {
      id: 'dashboard',
      label: 'Özet',
      icon: LayoutDashboard,
      badge: pendingFocusTasks,
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'projects',
      label: 'Projeler',
      icon: Code2,
      badge: activeProjects,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'school',
      label: 'Okul',
      icon: GraduationCap,
      badge: pendingAcadTasks,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'clients',
      label: 'Tasarım',
      icon: Palette,
      badge: activeOrders,
      badgeColor: 'bg-purple-500',
    },
    {
      id: 'content',
      label: 'İçerik',
      icon: Video,
      badge: activeContent,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'finance',
      label: 'Finans',
      icon: Wallet,
      badge: 0,
      badgeColor: '',
    },
    {
      id: 'notes',
      label: 'Notlar',
      icon: FileText,
      badge: state.notes.length,
      badgeColor: 'bg-neutral-500',
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-xl border-t border-[#e8e8e6] dark:border-[#2a2a2a] select-none transition-colors"
      style={{
        paddingBottom: 'max(10px, env(safe-area-inset-bottom, 16px))',
        paddingTop: '6px',
      }}
    >
      <div className="flex items-center justify-between px-1 max-w-[420px] mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-0.5 group relative transition-transform active:scale-90"
              style={{ minWidth: '46px' }}
            >
              {/* Icon Container with Distinct Active Pill */}
              <div
                className={`relative px-2.5 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-md scale-105'
                    : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Subtle notification dot on inactive icons */}
                {!isActive && tab.badge > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-[#181818] ${tab.badgeColor}`}
                  />
                )}
              </div>

              {/* Label below icon */}
              <span
                className={`text-[9px] mt-0.5 tracking-tight transition-all truncate max-w-[50px] leading-tight ${
                  isActive
                    ? 'font-bold text-neutral-900 dark:text-neutral-100'
                    : 'font-medium text-neutral-400 dark:text-neutral-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
