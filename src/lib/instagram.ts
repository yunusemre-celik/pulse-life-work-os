export interface InstagramMediaItem {
  id: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl?: string;
  permalink: string;
  timestamp: string;
  likeCount?: number;
  commentsCount?: number;
}

export interface InstagramProfileMetrics {
  isLive: boolean;
  username: string;
  name: string;
  followersCount: number;
  mediaCount: number;
  profilePictureUrl?: string;
  recentMedia: InstagramMediaItem[];
}

const INSTAGRAM_TOKEN_STORAGE = 'pulse_instagram_token';
const INSTAGRAM_ACCOUNT_ID_STORAGE = 'pulse_instagram_account_id';

export function getInstagramCredentials() {
  if (typeof window === 'undefined') return { token: '', accountId: '' };
  return {
    token: localStorage.getItem(INSTAGRAM_TOKEN_STORAGE) || '',
    accountId: localStorage.getItem(INSTAGRAM_ACCOUNT_ID_STORAGE) || '',
  };
}

export function saveInstagramCredentials(token: string, accountId: string) {
  if (typeof window !== 'undefined') {
    if (token.trim()) localStorage.setItem(INSTAGRAM_TOKEN_STORAGE, token.trim());
    else localStorage.removeItem(INSTAGRAM_TOKEN_STORAGE);

    if (accountId.trim()) localStorage.setItem(INSTAGRAM_ACCOUNT_ID_STORAGE, accountId.trim());
    else localStorage.removeItem(INSTAGRAM_ACCOUNT_ID_STORAGE);
  }
}

export async function fetchInstagramData(): Promise<InstagramProfileMetrics> {
  const { token, accountId } = getInstagramCredentials();

  // If token and accountId are provided, call real Meta / Instagram Graph API
  if (token && accountId) {
    try {
      const profileRes = await fetch(
        `https://graph.facebook.com/v19.0/${accountId}?fields=username,name,profile_picture_url,followers_count,media_count&access_token=${token}`
      );

      if (profileRes.ok) {
        const profileData = await profileRes.json();

        // Fetch recent media / reels
        let recentMedia: InstagramMediaItem[] = [];
        const mediaRes = await fetch(
          `https://graph.facebook.com/v19.0/${accountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=4&access_token=${token}`
        );

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          recentMedia = (mediaData.data || []).map((m: any) => ({
            id: m.id,
            caption: m.caption ? m.caption.split('\n')[0] : '',
            mediaType: m.media_type,
            mediaUrl: m.media_url,
            permalink: m.permalink,
            timestamp: m.timestamp,
            likeCount: m.like_count,
            commentsCount: m.comments_count,
          }));
        }

        return {
          isLive: true,
          username: profileData.username,
          name: profileData.name || profileData.username,
          followersCount: Number(profileData.followers_count) || 0,
          mediaCount: Number(profileData.media_count) || 0,
          profilePictureUrl: profileData.profile_picture_url,
          recentMedia,
        };
      }
    } catch (e) {
      console.warn('Instagram Graph API fetch error:', e);
    }
  }

  // Graceful sample preview when credentials are not yet entered
  return {
    isLive: false,
    username: 'yunus.design',
    name: 'Yunus Emre | Tasarım & Yazılım',
    followersCount: 4850,
    mediaCount: 52,
    recentMedia: [
      {
        id: 'ig-1',
        caption: 'Figma’da 60 saniyede modern sosyal medya şablonu',
        mediaType: 'VIDEO',
        permalink: 'https://instagram.com',
        timestamp: '2026-09-24',
        likeCount: 342,
        commentsCount: 28,
      },
      {
        id: 'ig-2',
        caption: 'Estetik klinik tasarım paketi vaka analizi (Carousel)',
        mediaType: 'CAROUSEL_ALBUM',
        permalink: 'https://instagram.com',
        timestamp: '2026-09-18',
        likeCount: 512,
        commentsCount: 45,
      },
    ],
  };
}
