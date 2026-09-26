'use client';

import React, { useState } from 'react';
import {
  Plus,
  Calendar,
  Sparkles,
  Menu,
  CheckSquare,
  Code2,
  GraduationCap,
  Palette,
  Video,
  Wallet,
  FileText,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface HeaderProps {
  onOpenQuickAdd: (type?: string) => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickAdd, onToggleMobileMenu }) => {
  const { activeTab } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Tab Titles
  const tabTitles: Record<string, { title: string; subtitle: string; icon: string }> = {
    dashboard: {
      title: 'Genel Bakış',
      subtitle: 'Bugünün öncelikleri, yaklaşan teslimler ve anlık durum.',
      icon: '⚡',
    },
    projects: {
      title: 'Yazılım Projeleri',
      subtitle: 'Geliştirdiğin uygulamalar, repo linkleri ve özellik takibi.',
      icon: '💻',
    },
    school: {
      title: 'Okul & Akademik',
      subtitle: 'Dersler, vize/final takvimleri, ödevler ve not hedefleri.',
      icon: '🎓',
    },
    clients: {
      title: 'Müşteri Tasarımları',
      subtitle: 'Freelance sosyal medya tasarımları, revizyonlar ve alacaklar.',
      icon: '🎨',
    },
    content: {
      title: 'Sosyal Medya & İçerik',
      subtitle: 'YouTube, Instagram ve X için içerik fikirleri ve üretim hattı.',
      icon: '📹',
    },
    finance: {
      title: 'Finans & Gelir/Gider',
      subtitle: 'Tasarım gelirleri, freelance kazançlar ve abonelik masrafları.',
      icon: '💰',
    },
    notes: {
      title: 'Notlar & Fikir Defteri',
      subtitle: 'Hızlıca aklına gelenler, fiyatlandırma notları ve hedefler.',
      icon: '📝',
    },
  };

  const currentInfo = tabTitles[activeTab] || tabTitles.dashboard;

  // Turkish date
  const today = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const quickAddOptions = [
    { id: 'focus_task', label: 'Bugünün Görevi', icon: CheckSquare },
    { id: 'project', label: 'Yazılım Projesi', icon: Code2 },
    { id: 'academic', label: 'Sınav / Ödev', icon: GraduationCap },
    { id: 'client_order', label: 'Müşteri Tasarım Siparişi', icon: Palette },
    { id: 'content', label: 'Sosyal Medya İçeriği', icon: Video },
    { id: 'transaction', label: 'Gelir / Gider', icon: Wallet },
    { id: 'note', label: 'Hızlı Not', icon: FileText },
  ];

  return (
    <header className="h-14 border-b border-[#e9e9e7] dark:border-[#2e2e2e] bg-[#ffffff] dark:bg-[#191919] px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base select-none">{currentInfo.icon}</span>
          <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
            {currentInfo.title}
          </h1>
          <span className="hidden sm:inline text-xs text-neutral-400 dark:text-neutral-500">
            — {currentInfo.subtitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Date chip */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium px-2.5 py-1 rounded-full bg-[#f6f6f4] dark:bg-[#252525]">
          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
          <span>{today}</span>
        </div>

        {/* Quick Add Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Hızlı Ekle</span>
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-56 rounded-lg bg-white dark:bg-[#222222] border border-[#e5e5e3] dark:border-[#333333] shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Neye ekleme yapacaksın?
                </div>
                {quickAddOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenQuickAdd(opt.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 hover:bg-[#f5f5f4] dark:hover:bg-[#2a2a2a] text-left transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
