'use client';

import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Tag,
  Search,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { QuickNote } from '@/types';

interface NotesViewProps {
  onOpenAddNote: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onOpenAddNote }) => {
  const { state, togglePinNote, deleteNote, addNote } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Tümü');

  // Quick Inline Note State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickTags, setQuickTags] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);

  // All distinct tags
  const allTags = Array.from(new Set(state.notes.flatMap((n) => n.tags)));

  const handleCreateQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() && !quickContent.trim()) return;

    addNote({
      title: quickTitle.trim() || 'Başlıksız Not',
      content: quickContent.trim(),
      tags: quickTags
        ? quickTags.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Genel'],
      isPinned: false,
    });

    setQuickTitle('');
    setQuickContent('');
    setQuickTags('');
    setIsExpanding(false);
  };

  const filteredNotes = state.notes.filter((note) => {
    const matchesTag = selectedTag === 'Tümü' || note.tags.includes(selectedTag);
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  // Sort pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Notlar, Fikirler & Hafıza
          </h2>
          <p className="text-xs text-neutral-500">
            Fiyatlandırma rehberlerin, proje fikirlerin, ders notların ve hızlı kayıtlar.
          </p>
        </div>

        <button
          onClick={onOpenAddNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium shadow-sm transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Yeni Not Ekle</span>
        </button>
      </div>

      {/* Notion-style Quick Note Creator Block */}
      <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm transition-all">
        {!isExpanding ? (
          <div
            onClick={() => setIsExpanding(true)}
            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-text py-1 px-1 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-neutral-400" />
            <span>Hızlıca aklına gelen bir şeyi not al...</span>
          </div>
        ) : (
          <form onSubmit={handleCreateQuickNote} className="space-y-3">
            <input
              type="text"
              placeholder="Not başlığı..."
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="w-full text-sm font-semibold bg-transparent border-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
              autoFocus
            />
            <textarea
              placeholder="Not içeriği, linkler veya fikirler..."
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              rows={3}
              className="w-full text-xs bg-transparent border-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none resize-none leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#f0f0ee] dark:border-[#2a2a2a]">
              <input
                type="text"
                placeholder="Etiketler (virgülle ayırın: Tasarım, İş)"
                value={quickTags}
                onChange={(e) => setQuickTags(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-md border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-700 dark:text-neutral-300 focus:outline-none min-w-[200px]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpanding(false)}
                  className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium rounded-md shadow-sm"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTag('Tümü')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              selectedTag === 'Tümü'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                : 'text-neutral-500 hover:bg-[#f2f2f0] dark:hover:bg-[#252525]'
            }`}
          >
            Tümü ({state.notes.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                selectedTag === tag
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                  : 'text-neutral-500 hover:bg-[#f2f2f0] dark:hover:bg-[#252525]'
              }`}
            >
              <Tag className="w-3 h-3 opacity-60" />
              <span>{tag}</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Notlarda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-white dark:bg-[#202020] text-neutral-800 dark:text-neutral-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedNotes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-neutral-400 border border-dashed border-[#e5e5e3] dark:border-[#2a2a2a] rounded-xl">
            Aradığınız kriterde not bulunamadı.
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`p-5 rounded-xl border bg-white dark:bg-[#1f1f1f] shadow-sm flex flex-col justify-between space-y-3 transition-all hover:border-neutral-300 dark:hover:border-neutral-600 ${
                note.isPinned
                  ? 'border-amber-200 dark:border-amber-900/50 bg-[#fffdf8] dark:bg-[#201f1c]'
                  : 'border-[#e5e5e3] dark:border-[#2a2a2a]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                    {note.title}
                  </h4>
                  <button
                    onClick={() => togglePinNote(note.id)}
                    className={`p-1 rounded transition-colors ${
                      note.isPinned
                        ? 'text-amber-500 fill-amber-500 hover:text-amber-600'
                        : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'
                    }`}
                    title={note.isPinned ? 'Sabitlemeyi kaldır' : 'En üste sabitle'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-line leading-relaxed">
                  {note.content}
                </p>
              </div>

              {/* Tags & Date & Delete */}
              <div className="pt-3 border-t border-[#f0f0ee] dark:border-[#2a2a2a] flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 text-neutral-400 hover:text-rose-500 transition-colors"
                  title="Notu Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
