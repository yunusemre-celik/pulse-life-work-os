'use client';

import React, { useState, useMemo } from 'react';
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
  Grid,
  List,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { AcademicTask, AcademicCourse } from '@/types';
import { groupCoursesByCode, getWeeklyScheduleGrid, UnifiedCourse } from '@/lib/courseUtils';

interface SchoolViewProps {
  onOpenAddCourse: () => void;
  onOpenAddTask: () => void;
}

export const SchoolView: React.FC<SchoolViewProps> = ({ onOpenAddCourse, onOpenAddTask }) => {
  const { state, toggleAcademicTask, deleteAcademicTask, deleteCourse } = useApp();
  const [filterType, setFilterType] = useState<string>('Tümü');
  const [courseViewMode, setCourseViewMode] = useState<'cards' | 'schedule'>('cards');

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

  // Group and normalize courses by code
  const unifiedCourses = useMemo(() => groupCoursesByCode(state.courses), [state.courses]);
  const weeklyGrid = useMemo(() => getWeeklyScheduleGrid(state.courses), [state.courses]);

  const totalCoursesCount = unifiedCourses.length;
  const totalEcts = unifiedCourses.reduce((acc, c) => acc + (c.ects || 0), 0);
  const pendingTasksCount = state.academicTasks.filter((t) => !t.isCompleted).length;

  const handleDeleteUnifiedCourse = (course: UnifiedCourse) => {
    course.courseIds.forEach((cId) => deleteCourse(cId));
  };

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
              {totalCoursesCount} Ders
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

      {/* Two Column Section: Left = Courses Cards & Schedule, Right = Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Section (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                Dönem Dersleri & Saatleri
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {totalCoursesCount} Ders
              </span>
            </div>

            {/* View Mode Toggle: Cards vs Weekly Timetable */}
            <div className="flex items-center bg-[#f0f0ee] dark:bg-[#252525] p-0.5 rounded-lg border border-[#e2e2e0] dark:border-[#333]">
              <button
                type="button"
                onClick={() => setCourseViewMode('cards')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  courseViewMode === 'cards'
                    ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Ders Kartları</span>
              </button>
              <button
                type="button"
                onClick={() => setCourseViewMode('schedule')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  courseViewMode === 'schedule'
                    ? 'bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Haftalık Program</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Cards Grouped by Course Code */}
          {courseViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {unifiedCourses.length === 0 ? (
                <div className="col-span-full p-8 text-center text-xs text-neutral-400 border border-dashed border-[#e5e5e3] dark:border-[#2a2a2a] rounded-xl">
                  Henüz kayıtlı ders bulunmuyor. &quot;Yeni Ders&quot; butonundan veya Ayarlar &gt; Veri İçe Aktar bölümünden derslerinizi yükleyin.
                </div>
              ) : (
                unifiedCourses.map((course) => (
                  <div
                    key={course.code || course.id}
                    className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
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

                      {/* Course schedules - lists all different days and classrooms */}
                      {course.allSchedules && course.allSchedules.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          {course.allSchedules.map((slot, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex flex-wrap items-center gap-1.5 text-[11px]"
                            >
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {slot.dayOfWeek} {slot.startTime}
                                {slot.endTime ? ` - ${slot.endTime}` : ''}
                              </span>
                              {slot.classroom && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-medium">
                                  📍 {slot.classroom}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium">
                            📍 Saatsiz / Proje &amp; Staj Dersi
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Grades row & Actions */}
                    <div className="pt-2 border-t border-[#f0f0ee] dark:border-[#2a2a2a] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[10px] text-neutral-400 block">Vize</span>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {course.midtermGrade !== null && course.midtermGrade !== undefined
                              ? course.midtermGrade
                              : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block">Final</span>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {course.finalGrade !== null && course.finalGrade !== undefined
                              ? course.finalGrade
                              : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-400 font-mono font-semibold">
                          {course.ects} AKTS
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteUnifiedCourse(course)}
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
          )}

          {/* VIEW MODE 2: Weekly Schedule Grid (Timetable) */}
          {courseViewMode === 'schedule' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {weeklyGrid.days.map(({ day, sessions }) => (
                  <div
                    key={day}
                    className="rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] overflow-hidden flex flex-col shadow-sm"
                  >
                    <div className="px-3 py-2 bg-neutral-50 dark:bg-[#252525] border-b border-[#e9e9e7] dark:border-[#2f2f2f] flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {day}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-neutral-400">
                        {sessions.length > 0 ? `${sessions.length} ders` : 'Boş'}
                      </span>
                    </div>

                    <div className="p-2 space-y-2 flex-1 min-h-[140px]">
                      {sessions.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-3 text-[11px] text-neutral-400">
                          Ders yok
                        </div>
                      ) : (
                        sessions.map((sess, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#252525] space-y-1 transition-all hover:border-neutral-400"
                            style={{
                              borderLeftColor: sess.colorTag || '#3b82f6',
                              borderLeftWidth: 3,
                            }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
                                {sess.courseCode}
                              </span>
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                {sess.startTime}
                                {sess.endTime ? ` - ${sess.endTime}` : ''}
                              </span>
                            </div>

                            <h5 className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                              {sess.courseName}
                            </h5>

                            {sess.classroom && (
                              <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium truncate">
                                📍 {sess.classroom}
                              </p>
                            )}

                            {sess.instructor && (
                              <p className="text-[9px] text-neutral-400 truncate">
                                {sess.instructor}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Unscheduled / Independent Courses Banner */}
              {weeklyGrid.unscheduledCourses.length > 0 && (
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#222] flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    📌 Saatsiz &amp; Proje / Staj Dersleri:
                  </span>
                  {weeklyGrid.unscheduledCourses.map((uc) => (
                    <span
                      key={uc.code || uc.id}
                      className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-medium shadow-sm flex items-center gap-1.5"
                    >
                      <span className="font-mono font-bold text-[10px] text-purple-600 dark:text-purple-400">
                        {uc.code}
                      </span>
                      <span>{uc.name}</span>
                      <span className="text-[10px] text-neutral-400">({uc.ects} AKTS)</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
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
