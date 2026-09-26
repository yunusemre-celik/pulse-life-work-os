'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Github,
  GitCommit,
  Star,
  GitFork,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import {
  fetchGithubRepoData,
  GithubRepoInfo,
  formatTimeAgo,
  parseGithubUrl,
} from '@/lib/github';
import { sanitizeUrl } from '@/lib/security';

interface GithubProjectWidgetProps {
  githubUrl: string;
}

export const GithubProjectWidget: React.FC<GithubProjectWidgetProps> = ({ githubUrl }) => {
  const [data, setData] = useState<GithubRepoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const parsed = parseGithubUrl(githubUrl);

  const loadData = useCallback(async () => {
    if (!githubUrl || !parsed) return;
    setLoading(true);
    setError(null);

    const res = await fetchGithubRepoData(githubUrl);
    setLoading(false);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || 'GitHub verisi alınamadı');
    }
  }, [githubUrl, parsed]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!parsed) return null;

  return (
    <div className="pt-2 border-t border-[#f0f0ee] dark:border-[#2a2a2a] space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-semibold text-neutral-700 dark:text-neutral-300">
          <Github className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
          <span>Canlı GitHub</span>
          {data?.language && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono">
              {data.language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {data && (
            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mr-1">
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                {data.stars}
              </span>
              <span className="flex items-center gap-0.5">
                <GitFork className="w-3 h-3" />
                {data.forks}
              </span>
            </div>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            title="GitHub'dan canlı güncelle"
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-[#f0f0ee] dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {loading && !data && (
        <div className="py-2 text-center text-[10px] text-neutral-400 animate-pulse">
          GitHub commitleri çekiliyor...
        </div>
      )}

      {error && !data && (
        <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-500 flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Latest Commit Box */}
      {data && data.recentCommits.length > 0 && (
        <div className="space-y-1.5">
          <div className="p-2 rounded-lg bg-[#fafafa] dark:bg-[#252525] border border-[#e8e8e6] dark:border-[#2e2e2e] space-y-1 text-xs">
            <div className="flex items-center justify-between text-[10px] text-neutral-400">
              <span className="flex items-center gap-1 font-semibold text-neutral-600 dark:text-neutral-300">
                <GitCommit className="w-3 h-3 text-emerald-500" /> Son Değişiklik
              </span>
              <span className="font-mono">{formatTimeAgo(data.recentCommits[0].date)}</span>
            </div>

            <p className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200 line-clamp-1">
              {data.recentCommits[0].message}
            </p>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
              <span className="truncate max-w-[130px]">
                {data.recentCommits[0].authorName}
              </span>
              {sanitizeUrl(data.recentCommits[0].url) && (
                <a
                  href={sanitizeUrl(data.recentCommits[0].url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <span>{data.recentCommits[0].shortSha}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          {/* Expandable History (5 Commits) */}
          {data.recentCommits.length > 1 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full py-1 text-[10px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center gap-1 transition-colors"
              >
                <span>{showHistory ? 'Geçmişi Gizle' : `Son ${data.recentCommits.length} Değişikliği Gör`}</span>
                {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showHistory && (
                <div className="space-y-1 pt-1 max-h-36 overflow-y-auto pr-0.5 animate-in fade-in duration-150">
                  {data.recentCommits.slice(1).map((commit) => (
                    <div
                      key={commit.sha}
                      className="p-1.5 rounded border border-[#efefed] dark:border-[#2a2a2a] bg-white dark:bg-[#202020] text-[10px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="font-mono text-neutral-500">{commit.shortSha}</span>
                        <span>{formatTimeAgo(commit.date)}</span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 font-medium line-clamp-1">
                        {commit.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
