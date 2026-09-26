'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  BookOpen,
  Award,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AcademicTask, AcademicCourse } from '@/types';

interface SchoolViewProps {
  onOpenAddCourse: () => void;
  onOpenAddTask: () => void;
}

export const SchoolView: React.FC<SchoolViewProps> = ({ onOpenAddCourse, onOpenAddTask }) => {
  const { state, toggleAcademicTask, deleteAcademicTask, deleteCourse } = useApp();
  const [filterType, setFilterType] = useState<string>('Tümü');

  const types = ['Tümü', 'Vize', 'Final', 'Ödev / Proje', 'Quiz'];

  const filteredTasks = state.academicTasks.filter((t) => {
    if (filterType === 'Tümü') return true;
    return t.type === filterType;
  });

  const getDaysDiff = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalEcts = state.courses.reduce((acc, c) => acc + c.ects, 0);
  const pendingTasksCount = state.academicTasks.filter((t) => !t.isCompleted).length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Okul & Akademik Yönetim
          </h2>
          <p className="text-xs text-neutral-500">
            Ders programı, vize/final geri sayımları, ödevler ve hedef not takibi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddCourse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#252525] text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Yeni Ders</span>
          </button>
          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Sınav / Ödev Ekle</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm">
          <span className="text-xs text-neutral-500">Kayıtlı Ders Sayısı</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {state.courses.length} Ders
            </span>
            <span className="text-xs text-neutral-400 font-medium">Toplam {totalEcts} AKTS</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm">
          <span className="text-xs text-neutral-500">Bekleyen Teslim & Sınav</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {pendingTasksCount}
            </span>
            <span className="text-xs text-neutral-400 font-medium">Bu dönem</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm">
          <span className="text-xs text-neutral-500">Genel Hedef Not Ortalaması</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              3.50+
            </span>
            <span className="text-xs text-emerald-600 font-medium">Yüksek Onur Hedefi</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Left = Courses Cards, Right = Exam & Assignment Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Section (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>Dönem Dersleri & Not Hedefleri</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {state.courses.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-neutral-400 border border-dashed border-[#e5e5e3] dark:border-[#2a2a2a] rounded-xl">
                Henüz kayıtlı ders bulunmuyor. &quot;Yeni Ders&quot; butonundan derslerinizi, sınıf ve saatlerini ekleyin.
              </div>
            ) : (
              state.courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        {course.code}
                      </span>
                      <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                        Hedef: {course.letterGradeGoal || 'AA'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {course.name}
                    </h4>

                    {course.instructor && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {course.instructor}
                      </p>
                    )}

                    {/* Classroom and Schedule Badges */}
                    {(course.classroom || (course.dayOfWeek && course.startTime)) && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {course.classroom && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-medium">
                            📍 Sınıf: {course.classroom}
                          </span>
                        )}
                        {course.dayOfWeek && course.startTime && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-medium">
                            🕒 {course.dayOfWeek} {course.startTime}{course.endTime ? ` - ${course.endTime}` : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grades row */}
                  <div className="pt-2 border-t border-[#f0f0ee] dark:border-[#2a2a2a] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Vize</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {course.midtermGrade !== null ? course.midtermGrade : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Final</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {course.finalGrade !== null ? course.finalGrade : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {course.ects} AKTS
                      </span>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="p-1 text-neutral-400 hover:text-rose-500 transition-colors"
                        title="Dersi Sil"
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

        {/* Exam & Assignment Countdown Timeline (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Sınav & Teslim Takvimi</span>
            </h3>
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-all ${
                  filterType === t
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                    : 'text-neutral-500 hover:bg-[#f2f2f0] dark:hover:bg-[#252525]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-400 border border-dashed border-[#e5e5e3] dark:border-[#2a2a2a] rounded-xl">
                Seçili filtrede sınav veya ödev bulunamadı.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const daysLeft = getDaysDiff(task.dueDate);
                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm space-y-2 ${
                      task.isCompleted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          onClick={() => toggleAcademicTask(task.id)}
                          className="mt-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 shrink-0"
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/40" />
                          ) : (
                            <Circle className="w-4 h-4 text-neutral-300 dark:text-neutral-600" />
                          )}
                        </button>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                            {task.courseName}
                          </span>
                          <h4
                            className={`text-xs font-semibold text-neutral-800 dark:text-neutral-200 ${
                              task.isCompleted ? 'line-through text-neutral-400' : ''
                            }`}
                          >
                            {task.title}
                          </h4>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          daysLeft <= 2 && !task.isCompleted
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {task.isCompleted ? 'Tamamlandı' : daysLeft === 0 ? 'Bugün' : `${daysLeft} gün kaldı`}
                      </span>
                    </div>

                    {task.notes && (
                      <p className="text-[11px] text-neutral-500 pl-6 leading-relaxed">
                        {task.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-neutral-400 pl-6 pt-1">
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.dueDate} ({task.type})
                      </span>
                      <button
                        onClick={() => deleteAcademicTask(task.id)}
                        className="text-neutral-400 hover:text-rose-500"
                        title="Sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
