'use client';

import React, { useState, useEffect } from 'react';
import {
  Youtube,
  Instagram,
  RefreshCw,
  ExternalLink,
  Users,
  Eye,
  Video,
  Heart,
  MessageCircle,
  Settings,
} from 'lucide-react';
import { fetchYoutubeData, YoutubeChannelMetrics } from '@/lib/youtube';
import { fetchInstagramData, InstagramProfileMetrics } from '@/lib/instagram';

interface CreatorApiCardsProps {
  onOpenSettings: () => void;
}

export const CreatorApiCards: React.FC<CreatorApiCardsProps> = ({ onOpenSettings }) => {
  const [ytData, setYtData] = useState<YoutubeChannelMetrics | null>(null);
  const [igData, setIgData] = useState<InstagramProfileMetrics | null>(null);
  const [loadingYt, setLoadingYt] = useState(false);
  const [loadingIg, setLoadingIg] = useState(false);

  const refreshYoutube = async () => {
    setLoadingYt(true);
    const data = await fetchYoutubeData();
    setYtData(data);
    setLoadingYt(false);
  };

  const refreshInstagram = async () => {
    setLoadingIg(true);
    const data = await fetchInstagramData();
    setIgData(data);
    setLoadingIg(false);
  };

  useEffect(() => {
    refreshYoutube();
    refreshInstagram();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. YouTube Data API Card */}
      <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <Youtube className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  {ytData?.channelTitle || 'YouTube Kanalı'}
                </h4>
                <span className="text-[10px] text-neutral-400">YouTube Data API v3</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  ytData?.isLive
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                {ytData?.isLive ? 'Canlı API' : 'Önizleme'}
              </span>

              <button
                onClick={refreshYoutube}
                disabled={loadingYt}
                title="Verileri Yenile"
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingYt ? 'animate-spin text-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-[#fafafa] dark:bg-[#252525] border border-[#e8e8e6] dark:border-[#2e2e2e] text-center">
            <div>
              <span className="text-[10px] text-neutral-400 block flex items-center justify-center gap-0.5">
                <Users className="w-2.5 h-2.5" /> Abone
              </span>
              <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {(ytData?.subscriberCount || 0).toLocaleString('tr-TR')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block flex items-center justify-center gap-0.5">
                <Eye className="w-2.5 h-2.5" /> İzlenme
              </span>
              <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {((ytData?.viewCount || 0) > 1000 ? `${Math.round((ytData?.viewCount || 0) / 1000)}B` : ytData?.viewCount)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block flex items-center justify-center gap-0.5">
                <Video className="w-2.5 h-2.5" /> Video
              </span>
              <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {ytData?.videoCount || 0}
              </span>
            </div>
          </div>

          {/* Recent Video Highlight */}
          {ytData?.recentVideos && ytData.recentVideos.length > 0 && (
            <div className="text-[11px] pt-1">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Son Video
              </span>
              <a
                href={ytData.recentVideos[0].url}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-800 dark:text-neutral-200 hover:text-red-600 dark:hover:text-red-400 transition-colors line-clamp-1 flex items-center justify-between gap-1 group font-medium"
              >
                <span className="truncate">{ytData.recentVideos[0].title}</span>
                <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-red-500 shrink-0" />
              </a>
            </div>
          )}
        </div>

        <button
          onClick={onOpenSettings}
          className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center justify-end gap-1 pt-1"
        >
          <Settings className="w-2.5 h-2.5" /> YouTube API Ayarla
        </button>
      </div>

      {/* 2. Instagram Graph API Card */}
      <div className="p-4 rounded-xl border border-[#e5e5e3] dark:border-[#2a2a2a] bg-white dark:bg-[#1f1f1f] shadow-sm flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  @{igData?.username || 'instagram'}
                </h4>
                <span className="text-[10px] text-neutral-400">Instagram Graph API</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  igData?.isLive
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                {igData?.isLive ? 'Canlı API' : 'Önizleme'}
              </span>

              <button
                onClick={refreshInstagram}
                disabled={loadingIg}
                title="Verileri Yenile"
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingIg ? 'animate-spin text-pink-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#fafafa] dark:bg-[#252525] border border-[#e8e8e6] dark:border-[#2e2e2e] text-center">
            <div>
              <span className="text-[10px] text-neutral-400 block flex items-center justify-center gap-0.5">
                <Users className="w-2.5 h-2.5" /> Takipçi
              </span>
              <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {(igData?.followersCount || 0).toLocaleString('tr-TR')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block flex items-center justify-center gap-0.5">
                <Eye className="w-2.5 h-2.5" /> Gönderi & Reel
              </span>
              <span className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {igData?.mediaCount || 0}
              </span>
            </div>
          </div>

          {/* Recent Media Highlight */}
          {igData?.recentMedia && igData.recentMedia.length > 0 && (
            <div className="text-[11px] pt-1">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Son Gönderi Etkileşimi
              </span>
              <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                <span className="truncate max-w-[180px] font-medium">
                  {igData.recentMedia[0].caption || 'Reel / Post'}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono shrink-0">
                  <span className="flex items-center gap-0.5 text-rose-500">
                    <Heart className="w-2.5 h-2.5 fill-rose-500" />
                    {igData.recentMedia[0].likeCount || 0}
                  </span>
                  <span className="flex items-center gap-0.5 text-blue-500">
                    <MessageCircle className="w-2.5 h-2.5" />
                    {igData.recentMedia[0].commentsCount || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onOpenSettings}
          className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center justify-end gap-1 pt-1"
        >
          <Settings className="w-2.5 h-2.5" /> Instagram Graph Token Ayarla
        </button>
      </div>
    </div>
  );
};
