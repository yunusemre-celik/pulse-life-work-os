/**
 * src/lib/security.ts
 * Pulse OS - Güvenlik ve Girdi Sanitizasyon Yardımcıları
 */

/**
 * XSS engellemek için kullanıcı veya API kaynaklı linkleri doğrular.
 * Sadece 'http://' ve 'https://' protokollerine (veya dahili relative yollara) izin verir.
 * 'javascript:', 'data:', 'vbscript:' gibi tehlikeli sözde protokolleri engeller.
 */
export function sanitizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Tehlikeli protokolleri doğrudan tespit et
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return undefined;
  }

  // Protokolü eksik web adreslerini (örn: www.figma.com veya github.com/user) otomatik tamamla
  let normalized = trimmed;
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+/.test(normalized) && !normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }

  try {
    const parsed = new URL(normalized, 'https://pulse-os.local');
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      // Sadece geçerli http/https veya güvenli relative bağlantıları döndür
      if (normalized.startsWith('http://') || normalized.startsWith('https://') || normalized.startsWith('/')) {
        return normalized;
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}

/**
 * Supabase Service Role (Secret) anahtarının istemci tarafına yapıştırılmasını engeller.
 * Service role anahtarı RLS'yi bypass ettiği için asla frontend'de bulunmamalıdır.
 */
export function isServiceRoleKey(key: string): boolean {
  if (!key) return false;
  try {
    const parts = key.trim().split('.');
    if (parts.length === 3) {
      const payloadStr = typeof window !== 'undefined' ? atob(parts[1]) : Buffer.from(parts[1], 'base64').toString('utf-8');
      const payload = JSON.parse(payloadStr);
      return payload.role === 'service_role';
    }
  } catch {
    // JWT formatı değilse veya decode edilemezse kontrol dışı bırak
  }
  return false;
}
