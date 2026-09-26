'use client';

import React, { useState } from 'react';
import {
  Code2,
  Plus,
  Github,
  ExternalLink,
  CheckCircle2,
  Circle,
  MoreVertical,
  Trash2,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SoftwareProject } from '@/types';
import { sanitizeUrl } from '@/lib/security';
import { GithubProjectWidget } from './GithubProjectWidget';

interface ProjectsViewProps {
  onOpenAddProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenAddProject }) => {
  const { state, toggleProjectTask, deleteProject } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const statusList = ['Tümü', 'Geliştirmede', 'Canlıda', 'Fikir', 'Donduruldu'];

  const filteredProjects = state.projects.filter((p) => {
    const matchesStatus = filterStatus === 'Tümü' || p.status === filterStatus;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusColors: Record<string, string> = {
    Geliştirmede: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    Canlıda: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    Fikir: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    Donduruldu: 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700',
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top action & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Yazılım Projeleri & Repolar
          </h2>
          <p className="text-xs text-neutral-500">
            Geliştirdiğin tüm uygulamalar, tech stack'ler ve gerçek zamanlı GitHub commitleri.
          </p>
        </div>

        <button
          onClick={onOpenAddProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Yeni Proje Ekle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {statusList.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                filterStatus === status
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-[#f2f2f0] dark:hover:bg-[#252525]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Proje veya teknoloji ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-white dark:bg-[#202020] text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="p-5 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm flex flex-col justify-between space-y-4 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all"
          >
            <div className="space-y-2.5">
              {/* Header tags */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {project.category}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    statusColors[project.status] || ''
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {project.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-medium text-neutral-500">
                  <span>İlerleme</span>
                  <span>%{project.progress}</span>
                </div>
                <div className="w-full h-1.5 bg-[#f0f0ee] dark:bg-[#2c2c2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 dark:bg-neutral-200 transition-all duration-300 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#f6f6f4] dark:bg-[#272727] text-neutral-600 dark:text-neutral-300 font-mono"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Task Checklist */}
              {project.tasks.length > 0 && (
                <div className="pt-2 border-t border-[#f0f0ee] dark:border-[#2a2a2a] space-y-1.5">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Özellik & Görevler ({project.tasks.filter((t) => t.completed).length}/
                    {project.tasks.length})
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {project.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleProjectTask(project.id, task.id)}
                        className="w-full text-left flex items-center gap-2 text-xs py-0.5 text-neutral-700 dark:text-neutral-300 group"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400 shrink-0" />
                        )}
                        <span
                          className={`truncate ${
                            task.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time GitHub Activity Widget */}
              {project.githubUrl && (
                <GithubProjectWidget githubUrl={project.githubUrl} />
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#f0f0ee] dark:border-[#2a2a2a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sanitizeUrl(project.githubUrl) && (
                  <a
                    href={sanitizeUrl(project.githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-[#f0f0ee] dark:hover:bg-[#2a2a2a] transition-colors"
                    title="GitHub Reposuna Git"
                  >
                    <Github className="w-3.5 h-3.5" />
                  </a>
                )}
                {sanitizeUrl(project.liveUrl) && (
                  <a
                    href={sanitizeUrl(project.liveUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-[#f0f0ee] dark:hover:bg-[#2a2a2a] transition-colors"
                    title="Canlı Demo / Web Sitesi"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <button
                onClick={() => deleteProject(project.id)}
                className="p-1.5 rounded-md text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Projeyi Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
