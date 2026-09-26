export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  views?: number;
  likes?: number;
  url: string;
}

export interface YoutubeChannelMetrics {
  isLive: boolean;
  channelTitle: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  avatarUrl: string;
  recentVideos: YoutubeVideo[];
}

const YOUTUBE_KEY_STORAGE = 'pulse_youtube_api_key';
const YOUTUBE_CHANNEL_STORAGE = 'pulse_youtube_channel_id';

export function getYoutubeCredentials() {
  if (typeof window === 'undefined') return { apiKey: '', channelId: '' };
  return {
    apiKey: localStorage.getItem(YOUTUBE_KEY_STORAGE) || '',
    channelId: localStorage.getItem(YOUTUBE_CHANNEL_STORAGE) || '',
  };
}

export function saveYoutubeCredentials(apiKey: string, channelId: string) {
  if (typeof window !== 'undefined') {
    if (apiKey.trim()) localStorage.setItem(YOUTUBE_KEY_STORAGE, apiKey.trim());
    else localStorage.removeItem(YOUTUBE_KEY_STORAGE);

    if (channelId.trim()) localStorage.setItem(YOUTUBE_CHANNEL_STORAGE, channelId.trim());
    else localStorage.removeItem(YOUTUBE_CHANNEL_STORAGE);
  }
}

export async function fetchYoutubeData(): Promise<YoutubeChannelMetrics> {
  const { apiKey, channelId } = getYoutubeCredentials();

  // If credentials are provided, call real YouTube Data API v3
  if (apiKey && channelId) {
    try {
      const channelParam = channelId.startsWith('@')
        ? `forHandle=${encodeURIComponent(channelId)}`
        : channelId.startsWith('UC')
        ? `id=${channelId}`
        : `forUsername=${channelId}`;

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&${channelParam}&key=${apiKey}`
      );

      if (res.ok) {
        const json = await res.json();
        if (json.items && json.items.length > 0) {
          const item = json.items[0];
          const stats = item.statistics;
          const snippet = item.snippet;
          const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;

          let recentVideos: YoutubeVideo[] = [];

          if (uploadsPlaylistId) {
            const playlistRes = await fetch(
              `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${apiKey}`
            );
            if (playlistRes.ok) {
              const playlistJson = await playlistRes.json();
              recentVideos = (playlistJson.items || []).map((pv: any) => ({
                id: pv.snippet.resourceId.videoId,
                title: pv.snippet.title,
                thumbnail: pv.snippet.thumbnails?.medium?.url || pv.snippet.thumbnails?.default?.url,
                publishedAt: pv.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${pv.snippet.resourceId.videoId}`,
              }));
            }
          }

          return {
            isLive: true,
            channelTitle: snippet.title,
            subscriberCount: Number(stats.subscriberCount) || 0,
            viewCount: Number(stats.viewCount) || 0,
            videoCount: Number(stats.videoCount) || 0,
            avatarUrl: snippet.thumbnails?.default?.url || '',
            recentVideos,
          };
        }
      }
    } catch (e) {
      console.warn('YouTube Data API fetch error:', e);
    }
  }

  // Graceful sample preview when API credentials are not entered yet
  return {
    isLive: false,
    channelTitle: 'Yunus Emre (Creator)',
    subscriberCount: 2450,
    viewCount: 148200,
    videoCount: 24,
    avatarUrl: '',
    recentVideos: [
      {
        id: 'v1',
        title: 'Yazılımcılar İçin En Verimli Notion Şablonu Kurulumu',
        thumbnail: '',
        publishedAt: '2026-09-20',
        views: 1240,
        likes: 184,
        url: 'https://youtube.com',
      },
      {
        id: 'v2',
        title: 'Öğrenciyken Freelance Tasarım İle Ayda 25.000 TL Kazanmak',
        thumbnail: '',
        publishedAt: '2026-09-12',
        views: 3890,
        likes: 412,
        url: 'https://youtube.com',
      },
    ],
  };
}
