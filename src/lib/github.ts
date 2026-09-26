export interface GithubCommit {
  sha: string;
  shortSha: string;
  message: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  url: string;
}

export interface GithubRepoInfo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  defaultBranch: string;
  pushedAt: string;
  openIssues: number;
  url: string;
  recentCommits: GithubCommit[];
}

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;
  const cleaned = url.trim().replace(/\/$/, '');
  const match = cleaned.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }
  // Also support "owner/repo" shorthand
  const shortMatch = cleaned.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9._-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }
  return null;
}

export function getGithubToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('pulse_github_token') || '';
}

export function saveGithubToken(token: string): void {
  if (typeof window !== 'undefined') {
    if (token.trim()) {
      localStorage.setItem('pulse_github_token', token.trim());
    } else {
      localStorage.removeItem('pulse_github_token');
    }
  }
}

export async function fetchGithubRepoData(
  githubUrl: string
): Promise<{ success: boolean; data?: GithubRepoInfo; error?: string }> {
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) {
    return { success: false, error: 'Geçersiz GitHub URL' };
  }

  const { owner, repo } = parsed;
  const token = getGithubToken();

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    // 1. Fetch repo details
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return { success: false, error: 'GitHub reposu bulunamadı (veya repo gizli).' };
      }
      if (repoRes.status === 403) {
        return {
          success: false,
          error: 'GitHub API istek limitine ulaşıldı. Ayarlardan bir GitHub Token ekleyebilirsiniz.',
        };
      }
      return { success: false, error: `GitHub API Hatası: ${repoRes.statusText}` };
    }
    const repoData = await repoRes.json();

    // 2. Fetch last 5 commits
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`,
      { headers }
    );
    let commits: GithubCommit[] = [];
    if (commitsRes.ok) {
      const commitsData = await commitsRes.json();
      commits = commitsData.map((c: any) => ({
        sha: c.sha,
        shortSha: c.sha.slice(0, 7),
        message: c.commit.message.split('\n')[0], // First line
        authorName: c.commit.author?.name || c.author?.login || 'Geliştirici',
        authorAvatar: c.author?.avatar_url,
        date: c.commit.author?.date || c.commit.committer?.date,
        url: c.html_url,
      }));
    }

    return {
      success: true,
      data: {
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description || '',
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language || 'Code',
        defaultBranch: repoData.default_branch,
        pushedAt: repoData.pushed_at,
        openIssues: repoData.open_issues_count,
        url: repoData.html_url,
        recentCommits: commits,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Bağlantı hatası';
    return { success: false, error: errorMsg };
  }
}

export function formatTimeAgo(dateString: string): string {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'az önce';
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays === 1) return 'dün';
  if (diffDays < 30) return `${diffDays} gün önce`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} ay önce`;
}
