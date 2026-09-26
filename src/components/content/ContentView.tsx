'use client';

import React, { useState } from 'react';
import {
  Video,
  Plus,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Calendar,
  Sparkles,
  ExternalLink,
  Trash2,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { ContentItem } from '@/types';
import { sanitizeUrl } from '@/lib/security';
import { CreatorApiCards } from './CreatorApiCards';

interface ContentViewProps {
  onOpenAddContent: () => void;
  onOpenSettings?: () => void;
}

export const ContentView: React.FC<ContentViewProps> = ({ onOpenAddContent, onOpenSettings = () => {} }) => {
  const { state, updateContentItem, deleteContentItem } = useApp();
  const [platformFilter, setPlatformFilter] = useState<string>('Tümü');

  const platforms = ['Tümü', 'Instagram', 'YouTube', 'TikTok', 'X', 'LinkedIn'];

  const stages: Array<ContentItem['status']> = [
    'Fikir',
    'Senaryo',
    'Görsel / Çekim',
    'Kurguda',
    'Planlandı',
    'Yayınlandı',
  ];

  const filteredItems = state.contentItems.filter((item) => {
    if (platformFilter === 'Tümü') return true;
    return item.platform === platformFilter;
  });

  const getPlatformIcon = (platform: ContentItem['platform']) => {
    switch (platform) {
      case 'YouTube':
        return <Youtube className="w-3.5 h-3.5 text-red-500" />;
      case 'Instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
      case 'X':
        return <Twitter className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />;
      case 'LinkedIn':
        return <Linkedin className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Video className="w-3.5 h-3.5 text-neutral-500" />;
    }
  };

  const getPlatformColor = (platform: ContentItem['platform']) => {
    switch (platform) {
      case 'YouTube':
        return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900';
      case 'Instagram':
        return 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-900';
      case 'TikTok':
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700';
      case 'X':
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-700';
      case 'LinkedIn':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const handleStageChange = (item: ContentItem, newStatus: ContentItem['status']) => {
    updateContentItem({
      ...item,
      status: newStatus,
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Sosyal Medya & İçerik Stüdyosu
          </h2>
          <p className="text-xs text-neutral-500">
            Fikir havuzu, senaryo notları, video kurguları ve planlanan yayın takvimi.
          </p>
        </div>

        <button
          onClick={onOpenAddContent}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium shadow-sm transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Yeni İçerik Ekle</span>
        </button>
      </div>

      {/* Live Creator API Cards (YouTube & Instagram) */}
      <CreatorApiCards onOpenSettings={onOpenSettings} />

      {/* Platform Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              platformFilter === p
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                : 'text-neutral-500 hover:bg-[#f2f2f0] dark:hover:bg-[#252525]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Content Kanban / Columns View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-neutral-400 border border-dashed border-[#e5e5e3] dark:border-[#2a2a2a] rounded-xl">
            Bu kategoride içerik bulunmuyor. Yeni bir video veya post fikri ekleyin!
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all"
            >
              <div className="space-y-3">
                {/* Platform and Format */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getPlatformIcon(item.platform)}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPlatformColor(
                        item.platform
                      )}`}
                    >
                      {item.platform}
                    </span>
                  </div>

                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {item.format}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                  {item.title}
                </h4>

                {/* Hook (Kanca Metni) */}
                {item.hook && (
                  <div className="p-2.5 rounded-lg bg-[#fbfbfa] dark:bg-[#252525] border border-[#e8e8e6] dark:border-[#2e2e2e]">
                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 block uppercase tracking-wider">
                      🎯 Kanca (Hook)
                    </span>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 italic mt-0.5">
                      &quot;{item.hook}&quot;
                    </p>
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-3">
                    {item.notes}
                  </p>
                )}

                {/* Stage dropdown */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Üretim Aşaması
                  </label>
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStageChange(item, e.target.value as ContentItem['status'])
                    }
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    {stages.map((stg) => (
                      <option key={stg} value={stg}>
                        {stg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#f0f0ee] dark:border-[#2a2a2a] flex items-center justify-between text-xs">
                {item.scheduledDate ? (
                  <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-neutral-400" />
                    {item.scheduledDate}
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-400">Tarih belirlenmedi</span>
                )}

                <div className="flex items-center gap-1.5">
                  {sanitizeUrl(item.url) && (
                    <a
                      href={sanitizeUrl(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                      title="İçeriğe Git"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => deleteContentItem(item.id)}
                    className="p-1 text-neutral-400 hover:text-rose-500"
                    title="İçeriği Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
