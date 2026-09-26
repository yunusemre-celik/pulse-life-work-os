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
  Settings,
  Sun,
  Moon,
  Database,
  RefreshCw,
  PanelLeftClose,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface SidebarProps {
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const {
    state,
    activeTab,
    setActiveTab,
    isDark,
    toggleDarkMode,
    isSyncing,
    supabaseConnected,
    syncWithSupabase,
    toggleSidebarCollapse,
    user,
    signOut,
  } = useApp();

  // Badge calculations
  const pendingFocusTasks = state.focusTasks.filter((t) => !t.completed).length;
  const activeProjects = state.projects.filter((p) => p.status === 'Geliştirmede').length;
  const pendingAcadTasks = state.academicTasks.filter((t) => !t.isCompleted).length;
  const activeOrders = state.clientOrders.filter((o) => o.status !== 'Teslim Edildi').length;
  const activeContent = state.contentItems.filter((c) => c.status !== 'Yayınlandı').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Genel Bakış',
      icon: LayoutDashboard,
      badge: pendingFocusTasks > 0 ? pendingFocusTasks : null,
      badgeColor: 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300',
    },
    {
      id: 'projects',
      label: 'Yazılım Projeleri',
      icon: Code2,
      badge: activeProjects > 0 ? activeProjects : null,
      badgeColor: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'school',
      label: 'Okul & Akademik',
      icon: GraduationCap,
      badge: pendingAcadTasks > 0 ? pendingAcadTasks : null,
      badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'clients',
      label: 'Müşteri Tasarımları',
      icon: Palette,
      badge: activeOrders > 0 ? activeOrders : null,
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'content',
      label: 'Sosyal Medya & İçerik',
      icon: Video,
      badge: activeContent > 0 ? activeContent : null,
      badgeColor: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300',
    },
    {
      id: 'finance',
      label: 'Finans & Gelir/Gider',
      icon: Wallet,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'notes',
      label: 'Notlar & Fikirler',
      icon: FileText,
      badge: state.notes.length > 0 ? state.notes.length : null,
      badgeColor: 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
    },
  ];

  return (
    <aside className="w-64 h-screen border-r border-[#e9e9e7] dark:border-[#2e2e2e] bg-[#fbfbfa] dark:bg-[#191919] flex flex-col justify-between shrink-0 select-none transition-all duration-200">
      {/* Top Profile / Workspace & Collapse Button */}
      <div className="p-3">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#efefed] dark:hover:bg-[#252525] transition-colors group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {user?.email ? user.email.slice(0, 1).toUpperCase() : 'Y'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight truncate">
                {user?.email ? user.email.split('@')[0] : 'Yunus Emre'}
              </span>
              <span className="text-[10px] text-neutral-400 truncate">
                {user?.email || 'Doğrulanmış Oturum'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleDarkMode}
              title={isDark ? 'Açık Moda Geç' : 'Koyu Moda Geç'}
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-[#e4e4e2] dark:hover:bg-[#303030] transition-colors"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Sidebar Collapse Toggle */}
            <button
              onClick={toggleSidebarCollapse}
              title="Kenar Çubuğunu Gizle (Ctrl+\)"
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-[#e4e4e2] dark:hover:bg-[#303030] transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="mt-4 space-y-0.5">
          <div className="px-3 pb-1.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Çalışma Alanları
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#efefed] dark:bg-[#272727] text-neutral-900 dark:text-neutral-100 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-[#f3f3f1] dark:hover:bg-[#222222] hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Database Status & Settings */}
      <div className="p-3 border-t border-[#e9e9e7] dark:border-[#2e2e2e] space-y-2">
        {/* Supabase Status Card */}
        <div className="px-2.5 py-2 rounded-md bg-[#f4f4f2] dark:bg-[#222222] border border-[#e5e5e3] dark:border-[#2c2c2c] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 min-w-0">
            <Database
              className={`w-3.5 h-3.5 shrink-0 ${
                supabaseConnected ? 'text-emerald-500' : 'text-neutral-400'
              }`}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
                {supabaseConnected ? 'Supabase Bulut' : 'Lokal Depolama'}
              </span>
              <span className="text-[10px] text-neutral-500 truncate">
                {supabaseConnected ? 'Veriler senkronize' : 'Cihazda saklanıyor'}
              </span>
            </div>
          </div>
          <button
            onClick={() => syncWithSupabase()}
            disabled={isSyncing}
            title="Senkronizasyonu tetikle"
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-[#e4e4e2] dark:hover:bg-[#303030] transition-colors shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>

        {/* Settings button */}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={onOpenSettings}
            className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-[#f0f0ee] dark:hover:bg-[#262626] transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-400" />
            <span>Ayarlar & DB</span>
          </button>

          {user && (
            <button
              onClick={signOut}
              title="Çıkış Yap"
              className="p-1.5 rounded-md text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
