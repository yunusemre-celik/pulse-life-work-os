import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isServiceRoleKey } from './security';

const STORAGE_KEY_URL = 'pulse_supabase_url';
const STORAGE_KEY_KEY = 'pulse_supabase_key';

export function getSupabaseCredentials() {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }

  const localUrl = localStorage.getItem(STORAGE_KEY_URL);
  const localKey = localStorage.getItem(STORAGE_KEY_KEY);

  const url = localUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = localKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return { url, key };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (isServiceRoleKey(key)) {
      throw new Error(
        'GÜVENLİK UYARISI: Service Role (Secret) anahtarını istemciye giremezsiniz! Service role anahtarı tüm güvenlik duvarlarını aşar. Lütfen yalnızca Anon (Public) anahtarını kullanın.'
      );
    }
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());

    // Invalidate client cache
    cachedClient = null;
    lastUsedUrl = '';
    lastUsedKey = '';
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    cachedClient = null;
    lastUsedUrl = '';
    lastUsedKey = '';
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();

  if (!url || !key) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: true },
    });
    lastUsedUrl = url;
    lastUsedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Supabase client creation error:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    if (isServiceRoleKey(key)) {
      return {
        success: false,
        message: 'GÜVENLİK UYARISI: Service Role anahtarı kullanılamaz! Lütfen Supabase panelinden Anon Key alın.',
      };
    }
    const testClient = createClient(url, key);
    // Try pinging or listing something simple
    const { error } = await testClient.from('projects').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still reachable
      if (error.message.includes('relation "public.projects" does not exist') || error.code === '42P01') {
        return {
          success: true,
          message: 'Supabase bağlantısı başarılı! (Tablolar henüz oluşturulmamış, SQL şemasını çalıştırabilirsiniz).',
        };
      }
      return { success: false, message: `Bağlantı hatası: ${error.message}` };
    }

    return { success: true, message: 'Supabase veritabanına başarıyla bağlandı!' };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return { success: false, message: `Hata: ${errorMessage}` };
  }
}
