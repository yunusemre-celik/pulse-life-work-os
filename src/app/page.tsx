'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { SchoolView } from '@/components/school/SchoolView';
import { ClientsView } from '@/components/clients/ClientsView';
import { ContentView } from '@/components/content/ContentView';
import { FinanceView } from '@/components/finance/FinanceView';
import { NotesView } from '@/components/notes/NotesView';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { QuickAddModal } from '@/components/modals/QuickAddModal';
import { checkAndTriggerDailyNotifications } from '@/lib/notifications';
import {
  PanelLeft,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';

export default function Home() {
  const {
    state,
    activeTab,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    user,
    isAuthChecking,
    isDark,
    toggleDarkMode,
  } = useApp();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<string>('focus_task');

  // Daily automated notifications check (08:00 morning focus & 20:00 evening summary)
  React.useEffect(() => {
    checkAndTriggerDailyNotifications(state);
    const interval = setInterval(() => {
      checkAndTriggerDailyNotifications(state);
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state]);

  const handleOpenQuickAdd = (type: string = 'focus_task') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  // Keyboard shortcut to toggle sidebar: Ctrl+\ or Cmd+\ or Ctrl+B
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '\\' || e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse]);

  // If checking authentication
  if (isAuthChecking) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#fbfbfa] dark:bg-[#141414]">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 animate-spin" />
      </div>
    );
  }

  // Only authenticated users can access the application
  if (!user) {
    return (
      <>
        <AuthScreen onOpenSettings={() => setIsSettingsOpen(true)} />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbfbfa] dark:bg-[#141414] relative">
      {/* Desktop Collapsible Sidebar */}
      <div
        className={`hidden md:block shrink-0 h-screen transition-all duration-300 ease-in-out overflow-hidden z-30 ${
          isSidebarCollapsed ? 'w-0 -ml-0 opacity-0 pointer-events-none' : 'w-64 opacity-100'
        }`}
      >
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      </div>

      {/* Floating Desktop Re-open Button (Fixed, Always Visible, Top Left) */}
      {isSidebarCollapsed && (
        <button
          onClick={toggleSidebarCollapse}
          title="Menüyü Göster (Ctrl+\ veya Ctrl+B)"
          className="hidden md:flex fixed top-3 left-3 z-50 items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#202020]/95 backdrop-blur-md border border-[#e5e5e3] dark:border-[#333] shadow-lg hover:shadow-xl text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#282828] transition-all hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <PanelLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold">Menüyü Aç</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
            Ctrl+\
          </kbd>
        </button>
      )}

      {/* Main Content Workspace (Minimalist Notion Style - No Horizontal Navbar!) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Mobile Top Controls (Settings & Theme Buttons - Compact iPhone 12 Header) */}
        <div className="md:hidden fixed top-3 right-3 z-30 flex items-center gap-1.5">
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-full bg-white/80 dark:bg-[#222]/80 backdrop-blur-md border border-[#e5e5e3] dark:border-[#333] text-neutral-600 dark:text-neutral-300 shadow-xs"
            title="Tema Değiştir"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-full bg-white/80 dark:bg-[#222]/80 backdrop-blur-md border border-[#e5e5e3] dark:border-[#333] text-neutral-600 dark:text-neutral-300 shadow-xs"
            title="Ayarlar"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Content Body with iPhone 12 Safe Area Padding */}
        <main
          className={`flex-1 overflow-y-auto px-4 md:px-0 transition-all ${
            isSidebarCollapsed ? 'pt-12 md:pt-14' : 'pt-2 md:pt-4'
          }`}
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 76px)',
          }}
        >
          {activeTab === 'dashboard' && (
            <DashboardView onOpenQuickAdd={handleOpenQuickAdd} />
          )}
          {activeTab === 'projects' && (
            <ProjectsView onOpenAddProject={() => handleOpenQuickAdd('project')} />
          )}
          {activeTab === 'school' && (
            <SchoolView
              onOpenAddCourse={() => handleOpenQuickAdd('course')}
              onOpenAddTask={() => handleOpenQuickAdd('academic')}
            />
          )}
          {activeTab === 'clients' && (
            <ClientsView onOpenAddOrder={() => handleOpenQuickAdd('client_order')} />
          )}
          {activeTab === 'content' && (
            <ContentView
              onOpenAddContent={() => handleOpenQuickAdd('content')}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}
          {activeTab === 'finance' && (
            <FinanceView onOpenAddTransaction={() => handleOpenQuickAdd('transaction')} />
          )}
          {activeTab === 'notes' && (
            <NotesView onOpenAddNote={() => handleOpenQuickAdd('note')} />
          )}
        </main>

        {/* iPhone 12 7-Tab Bottom Navigation Bar */}
        <BottomNav />
      </div>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        initialType={quickAddType}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
}
