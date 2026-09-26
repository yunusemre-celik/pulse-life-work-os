'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Code2,
  GraduationCap,
  Palette,
  Video,
  Wallet,
  FileText,
  BookOpen,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { MainCategory, Priority, ClientDesignOrder, ContentItem, Transaction, DayOfWeek } from '@/types';

interface QuickAddModalProps {
  isOpen: boolean;
  initialType?: string;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  initialType = 'focus_task',
  onClose,
}) => {
  const {
    addFocusTask,
    addProject,
    addCourse,
    addAcademicTask,
    addClientOrder,
    addContentItem,
    addTransaction,
    addNote,
    state,
  } = useApp();

  const [activeType, setActiveType] = useState<string>(initialType);

  useEffect(() => {
    if (initialType) {
      setActiveType(initialType);
    }
  }, [initialType, isOpen]);

  // Form States
  // 1. Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<MainCategory>('personal');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  // 2. Project
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectCat, setProjectCat] = useState<'Web App' | 'Mobile App' | 'API / Backend' | 'AI / ML' | 'Araç / Script'>('Web App');
  const [projectTech, setProjectTech] = useState('');
  const [projectGithub, setProjectGithub] = useState('');
  const [projectLive, setProjectLive] = useState('');

  // 3. Course
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [courseEcts, setCourseEcts] = useState(5);
  const [courseClassroom, setCourseClassroom] = useState('');
  const [courseDayOfWeek, setCourseDayOfWeek] = useState<DayOfWeek | ''>('Pazartesi');
  const [courseStartTime, setCourseStartTime] = useState('09:00');
  const [courseEndTime, setCourseEndTime] = useState('10:50');

  // 4. Academic Task
  const [acadTitle, setAcadTitle] = useState('');
  const [acadCourseName, setAcadCourseName] = useState('');
  const [acadType, setAcadType] = useState<'Vize' | 'Final' | 'Ödev / Proje' | 'Quiz'>('Ödev / Proje');
  const [acadDueDate, setAcadDueDate] = useState('');
  const [acadNotes, setAcadNotes] = useState('');

  // 5. Client Order
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDesignType, setOrderDesignType] = useState<ClientDesignOrder['designType']>('Instagram Post / Carousel');
  const [orderPrice, setOrderPrice] = useState(5000);
  const [orderPaid, setOrderPaid] = useState(0);
  const [orderDeliveryDate, setOrderDeliveryDate] = useState('');
  const [orderDeliveryUrl, setOrderDeliveryUrl] = useState('');
  const [orderBrief, setOrderBrief] = useState('');

  // 6. Content
  const [contentTitle, setContentTitle] = useState('');
  const [contentPlatform, setContentPlatform] = useState<ContentItem['platform']>('Instagram');
  const [contentFormat, setContentFormat] = useState<ContentItem['format']>('Reels / Short');
  const [contentHook, setContentHook] = useState('');
  const [contentDate, setContentDate] = useState('');
  const [contentNotes, setContentNotes] = useState('');

  // 7. Transaction
  const [txTitle, setTxTitle] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txAmount, setTxAmount] = useState(1000);
  const [txCategory, setTxCategory] = useState<Transaction['category']>('Tasarım Geliri');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // 8. Note
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === 'focus_task') {
      if (!taskTitle.trim()) return;
      addFocusTask({
        title: taskTitle.trim(),
        completed: false,
        priority: taskPriority,
        category: taskCategory,
        dueDate: taskDueDate || undefined,
      });
    } else if (activeType === 'project') {
      if (!projectName.trim()) return;
      addProject({
        name: projectName.trim(),
        description: projectDesc.trim(),
        category: projectCat,
        status: 'Geliştirmede',
        techStack: projectTech ? projectTech.split(',').map((t) => t.trim()) : ['React'],
        githubUrl: projectGithub || undefined,
        liveUrl: projectLive || undefined,
        progress: 10,
        tasks: [{ id: `pt-${Date.now()}`, title: 'İlk mimari kurulumu', completed: true }],
      });
    } else if (activeType === 'course') {
      if (!courseName.trim()) return;
      addCourse({
        name: courseName.trim(),
        code: courseCode.trim() || 'CENG101',
        instructor: courseInstructor.trim() || undefined,
        classroom: courseClassroom.trim() || undefined,
        dayOfWeek: (courseDayOfWeek as DayOfWeek) || undefined,
        startTime: courseStartTime || undefined,
        endTime: courseEndTime || undefined,
        credits: 3,
        ects: Number(courseEcts) || 5,
        midtermGrade: null,
        finalGrade: null,
        letterGradeGoal: 'AA',
        status: 'Devam Ediyor',
      });
    } else if (activeType === 'academic') {
      if (!acadTitle.trim()) return;
      addAcademicTask({
        title: acadTitle.trim(),
        courseName: acadCourseName || state.courses[0]?.name || 'Genel Ders',
        type: acadType,
        dueDate: acadDueDate || new Date().toISOString().split('T')[0],
        isCompleted: false,
        notes: acadNotes || undefined,
      });
    } else if (activeType === 'client_order') {
      if (!clientName.trim() || !orderTitle.trim()) return;
      addClientOrder({
        clientName: clientName.trim(),
        clientCompany: clientCompany.trim() || undefined,
        projectTitle: orderTitle.trim(),
        designType: orderDesignType,
        status: 'Brief Alındı',
        price: Number(orderPrice) || 0,
        paidAmount: Number(orderPaid) || 0,
        paymentStatus:
          Number(orderPaid) >= Number(orderPrice)
            ? 'Ödendi'
            : Number(orderPaid) > 0
            ? 'Kısmi Ödeme'
            : 'Bekliyor',
        deliveryDate: orderDeliveryDate || new Date().toISOString().split('T')[0],
        deliveryUrl: orderDeliveryUrl || undefined,
        briefNotes: orderBrief || undefined,
      });
    } else if (activeType === 'content') {
      if (!contentTitle.trim()) return;
      addContentItem({
        title: contentTitle.trim(),
        platform: contentPlatform,
        format: contentFormat,
        status: 'Fikir',
        hook: contentHook.trim() || undefined,
        scheduledDate: contentDate || undefined,
        notes: contentNotes.trim() || undefined,
      });
    } else if (activeType === 'transaction') {
      if (!txTitle.trim()) return;
      addTransaction({
        title: txTitle.trim(),
        type: txType,
        amount: Number(txAmount) || 0,
        category: txCategory,
        date: txDate,
      });
    } else if (activeType === 'note') {
      if (!noteTitle.trim() && !noteContent.trim()) return;
      addNote({
        title: noteTitle.trim() || 'Başlıksız Not',
        content: noteContent.trim(),
        tags: noteTags ? noteTags.split(',').map((t) => t.trim()) : ['Genel'],
        isPinned: false,
      });
    }

    onClose();
  };

  const navTypes = [
    { id: 'focus_task', label: 'Görev', icon: CheckSquare },
    { id: 'project', label: 'Proje', icon: Code2 },
    { id: 'academic', label: 'Sınav / Ödev', icon: GraduationCap },
    { id: 'course', label: 'Ders', icon: BookOpen },
    { id: 'client_order', label: 'Müşteri Tasarımı', icon: Palette },
    { id: 'content', label: 'İçerik', icon: Video },
    { id: 'transaction', label: 'Finans', icon: Wallet },
    { id: 'note', label: 'Not', icon: FileText },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100"
      style={{
        paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
      }}
    >
      <div className="bg-white dark:bg-[#1e1e1e] border border-[#e5e5e3] dark:border-[#2f2f2f] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-[#e9e9e7] dark:border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {navTypes.map((t) => {
              const Icon = t.icon;
              const isActive = activeType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveType(t.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
                    isActive
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-[#f2f2f0] dark:hover:bg-[#282828]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* 1. FOCUS TASK FORM */}
          {activeType === 'focus_task' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Görev Tanımı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bugün neyi bitireceksin?"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as MainCategory)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="personal">Kişisel</option>
                    <option value="dev">Yazılım</option>
                    <option value="school">Okul</option>
                    <option value="design">Tasarım</option>
                    <option value="content">İçerik</option>
                    <option value="finance">Finans</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Öncelik
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="high">🔴 Yüksek</option>
                    <option value="medium">🟡 Orta</option>
                    <option value="low">🟢 Düşük</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Hedef Tarih
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. PROJECT FORM */}
          {activeType === 'project' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Proje Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Pulse Life & Work OS"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Açıklama
                </label>
                <textarea
                  rows={2}
                  placeholder="Projenin amacı nedir?"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={projectCat}
                    onChange={(e) => setProjectCat(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="Web App">Web App</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="API / Backend">API / Backend</option>
                    <option value="AI / ML">AI / ML</option>
                    <option value="Araç / Script">Araç / Script</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Tech Stack (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    placeholder="Next.js, Tailwind, Supabase"
                    value={projectTech}
                    onChange={(e) => setProjectTech(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    GitHub Repo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={projectGithub}
                    onChange={(e) => setProjectGithub(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Canlı Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={projectLive}
                    onChange={(e) => setProjectLive(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. CLIENT ORDER FORM */}
          {activeType === 'client_order' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Müşteri / Marka Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Dr. Selin Kaya"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Şirket / Klinik Adı
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Aura Estetik"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Proje / Tasarım Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Aylık 12 Gönderi Instagram Tasarım Paketi"
                  value={orderTitle}
                  onChange={(e) => setOrderTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Tasarım Tipi
                  </label>
                  <select
                    value={orderDesignType}
                    onChange={(e) => setOrderDesignType(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="Instagram Post / Carousel">Instagram Post / Carousel</option>
                    <option value="Story / Reel Kurgusu">Story / Reel Kurgusu</option>
                    <option value="Banner / Reklam Görseli">Banner / Reklam Görseli</option>
                    <option value="Logo & Kurumsal Kimlik">Logo & Kimlik</option>
                    <option value="UI / Web Tasarımı">UI / Web Tasarımı</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Toplam Ücret (₺)
                  </label>
                  <input
                    type="number"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Alınan Avans (₺)
                  </label>
                  <input
                    type="number"
                    value={orderPaid}
                    onChange={(e) => setOrderPaid(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Teslim Tarihi
                  </label>
                  <input
                    type="date"
                    value={orderDeliveryDate}
                    onChange={(e) => setOrderDeliveryDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Figma / Drive Teslim Linki
                  </label>
                  <input
                    type="url"
                    placeholder="https://figma.com/..."
                    value={orderDeliveryUrl}
                    onChange={(e) => setOrderDeliveryUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Brief & Müşteri Notları
                </label>
                <textarea
                  rows={2}
                  placeholder="Renk tercihleri, revize detayları..."
                  value={orderBrief}
                  onChange={(e) => setOrderBrief(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 4. ACADEMIC TASK FORM */}
          {activeType === 'academic' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Sınav / Ödev Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: AVL Tree Algoritma Ödevi"
                  value={acadTitle}
                  onChange={(e) => setAcadTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Ders Adı
                  </label>
                  <input
                    type="text"
                    placeholder="Veri Yapıları"
                    value={acadCourseName}
                    onChange={(e) => setAcadCourseName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Tür
                  </label>
                  <select
                    value={acadType}
                    onChange={(e) => setAcadType(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="Ödev / Proje">Ödev / Proje</option>
                    <option value="Vize">Vize Sınavı</option>
                    <option value="Final">Final Sınavı</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Teslim / Sınav Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={acadDueDate}
                    onChange={(e) => setAcadDueDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Konular / Notlar
                </label>
                <textarea
                  rows={2}
                  placeholder="Dahil olan bölümler, gereksinimler..."
                  value={acadNotes}
                  onChange={(e) => setAcadNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 5. COURSE FORM */}
          {activeType === 'course' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Ders Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Veri Tabanı Sistemleri"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Ders Kodu
                  </label>
                  <input
                    type="text"
                    placeholder="CENG305"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Hoca / Öğretim Görevlisi
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. Öğr. Üyesi..."
                    value={courseInstructor}
                    onChange={(e) => setCourseInstructor(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    AKTS Kredisi
                  </label>
                  <input
                    type="number"
                    value={courseEcts}
                    onChange={(e) => setCourseEcts(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Classroom & Day of Week */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Sınıf / Derslik
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: B-204 veya Amfi 1"
                    value={courseClassroom}
                    onChange={(e) => setCourseClassroom(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Ders Günü
                  </label>
                  <select
                    value={courseDayOfWeek}
                    onChange={(e) => setCourseDayOfWeek(e.target.value as DayOfWeek)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="Pazartesi">Pazartesi</option>
                    <option value="Salı">Salı</option>
                    <option value="Çarşamba">Çarşamba</option>
                    <option value="Perşembe">Perşembe</option>
                    <option value="Cuma">Cuma</option>
                    <option value="Cumartesi">Cumartesi</option>
                    <option value="Pazar">Pazar</option>
                  </select>
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Başlangıç Saati
                  </label>
                  <input
                    type="time"
                    value={courseStartTime}
                    onChange={(e) => setCourseStartTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Bitiş Saati
                  </label>
                  <input
                    type="time"
                    value={courseEndTime}
                    onChange={(e) => setCourseEndTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notification info */}
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <span className="shrink-0 text-sm">🔔</span>
                <span>
                  <strong>15 Dakika Önceden Bildirim:</strong> Ders gününde başlangıç saatinden 15 dakika önce sınıf ve saat bilgisiyle telefonunuza bildirim gönderilecektir.
                </span>
              </div>
            </div>
          )}

          {/* 6. CONTENT FORM */}
          {activeType === 'content' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  İçerik Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 60 Saniyede Sosyal Medya Tasarımı"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Platform
                  </label>
                  <select
                    value={contentPlatform}
                    onChange={(e) => setContentPlatform(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="X">X (Twitter)</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Format
                  </label>
                  <select
                    value={contentFormat}
                    onChange={(e) => setContentFormat(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="Reels / Short">Reels / Short</option>
                    <option value="Carousel">Carousel</option>
                    <option value="Post">Tekil Post</option>
                    <option value="Uzun Video">Uzun Video</option>
                    <option value="Tweet / Thread">Tweet / Thread</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Kanca (Hook / İlk 3 Saniye Cümlesi)
                </label>
                <input
                  type="text"
                  placeholder="İzleyiciyi videoda tutacak ilk cümle..."
                  value={contentHook}
                  onChange={(e) => setContentHook(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Planlanan Tarih
                </label>
                <input
                  type="date"
                  value={contentDate}
                  onChange={(e) => setContentDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 7. TRANSACTION FORM */}
          {activeType === 'transaction' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  İşlem Açıklaması *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Dr. Selin Klinik Tasarım Ödemesi"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    İşlem Tipi
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType('income')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        txType === 'income'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-neutral-300 text-neutral-600'
                      }`}
                    >
                      + Gelir
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('expense')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        txType === 'expense'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'border-neutral-300 text-neutral-600'
                      }`}
                    >
                      - Gider
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Tutar (₺) *
                  </label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  >
                    <option value="Tasarım Geliri">Tasarım Geliri</option>
                    <option value="Freelance Yazılım">Freelance Yazılım</option>
                    <option value="Burs / Harçlık">Burs / Harçlık</option>
                    <option value="Yazılım & Abonelik">Yazılım & Abonelik</option>
                    <option value="Okul & Eğitim">Okul & Eğitim</option>
                    <option value="Tasarım Kaynakları">Tasarım Kaynakları</option>
                    <option value="Kişisel Yaşam">Kişisel Yaşam</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Tarih
                  </label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 8. NOTE FORM */}
          {activeType === 'note' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Not Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Tasarım Fiyatlandırma Notları"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  İçerik
                </label>
                <textarea
                  rows={4}
                  placeholder="Detaylar, linkler, maddeler..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Etiketler (virgülle ayırın)
                </label>
                <input
                  type="text"
                  placeholder="Tasarım, Fikir, İş"
                  value={noteTags}
                  onChange={(e) => setNoteTags(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="pt-3 border-t border-[#f0f0ee] dark:border-[#2a2a2a] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#282828] rounded-lg transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              Kaydet ve Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
