'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Key,
  Globe,
  Check,
  Bell,
  Smartphone,
  Youtube,
  Instagram,
  Send,
  DownloadCloud,
  Share2,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  clearSupabaseCredentials,
} from '@/lib/supabaseClient';
import { getGithubToken, saveGithubToken } from '@/lib/github';
import {
  getYoutubeCredentials,
  saveYoutubeCredentials,
} from '@/lib/youtube';
import {
  getInstagramCredentials,
  saveInstagramCredentials,
} from '@/lib/instagram';
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  sendPwaNotification,
  generateMorningReport,
  generateEveningReport,
  getNotificationPermission,
  isNotificationSupported,
} from '@/lib/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'general' | 'integrations' | 'backup';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'general',
}) => {
  const {
    state,
    supabaseConnected,
    isSyncing,
    syncWithSupabase,
    exportDataJson,
    importDataJson,
    resetToSampleData,
    purgeDeletedRecords,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'backup'>(initialTab);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Soft delete purge state
  const [purging, setPurging] = useState(false);
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  // GitHub state
  const [githubToken, setGithubToken] = useState('');
  const [githubSaved, setGithubSaved] = useState(false);

  // YouTube state
  const [ytKey, setYtKey] = useState('');
  const [ytChannel, setYtChannel] = useState('');
  const [ytSaved, setYtSaved] = useState(false);

  // Instagram state
  const [igToken, setIgToken] = useState('');
  const [igAccount, setIgAccount] = useState('');
  const [igSaved, setIgSaved] = useState(false);

  // Notifications state
  const [notifPerm, setNotifPerm] = useState<string>('default');
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [testNotifSent, setTestNotifSent] = useState(false);

  // PWA Install Prompt State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  // Backup & Import state
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
      setIsStandalone(standalone);

      const ua = window.navigator.userAgent.toLowerCase();
      setIsIos(/iphone|ipad|ipod/.test(ua));

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      const supa = getSupabaseCredentials();
      setSupabaseUrl(supa.url);
      setSupabaseKey(supa.key);

      setGithubToken(getGithubToken());

      const yt = getYoutubeCredentials();
      setYtKey(yt.apiKey);
      setYtChannel(yt.channelId);

      const ig = getInstagramCredentials();
      setIgToken(ig.token);
      setIgAccount(ig.accountId);

      const notif = getNotificationSettings();
      setMorningEnabled(notif.morningEnabled);
      setEveningEnabled(notif.eveningEnabled);
      setNotifPerm(getNotificationPermission());

      setTestResult(null);
      setImportStatus(null);
      setGithubSaved(false);
      setYtSaved(false);
      setIgSaved(false);
      setTestNotifSent(false);
    }
  }, [isOpen, initialTab]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsStandalone(true);
    }
    setDeferredPrompt(null);
  };

  if (!isOpen) return null;

  const handleTestAndSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      try {
        saveSupabaseCredentials(supabaseUrl, supabaseKey);
        await syncWithSupabase();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Kayıt hatası';
        setTestResult({ success: false, message: msg });
      }
    }
  };

  const handleDisconnectSupabase = () => {
    clearSupabaseCredentials();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestResult({ success: false, message: 'Supabase bağlantısı kaldırıldı. Lokal moddasınız.' });
  };

  const handleSaveSocialApis = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveYoutubeCredentials(ytKey, ytChannel);
    setYtSaved(true);

    await saveInstagramCredentials(igToken, igAccount);
    setIgSaved(true);
  };

  const handleRequestNotification = async () => {
    const granted = await requestNotificationPermission();
    setNotifPerm(granted ? 'granted' : 'denied');
    if (granted) {
      sendPwaNotification('🔔 Pulse OS Bildirimleri Aktif!', 'Sabah 08:00 ve akşam 20:00 günlük raporlarınız hazır.');
    }
  };

  const handleSaveNotificationToggles = () => {
    saveNotificationSettings({
      enabled: notifPerm === 'granted',
      morningEnabled,
      morningTime: '08:00',
      eveningEnabled,
      eveningTime: '20:00',
    });
  };

  const handleSendTestNotification = async (type: 'morning' | 'evening') => {
    if (notifPerm !== 'granted') {
      const ok = await requestNotificationPermission();
      if (!ok) return;
      setNotifPerm('granted');
    }

    if (type === 'morning') {
      const report = generateMorningReport(state);
      await sendPwaNotification(report.title, report.body);
    } else {
      const report = generateEveningReport(state);
      await sendPwaNotification(report.title, report.body);
    }
    setTestNotifSent(true);
    setTimeout(() => setTestNotifSent(false), 3000);
  };

  const handleManualPurge = async () => {
    setPurging(true);
    try {
      const res = await purgeDeletedRecords();
      setPurgeStatus(res.message);
      setTimeout(() => setPurgeStatus(null), 4000);
    } catch {
      setPurgeStatus('Temizleme sırasında hata oluştu.');
      setTimeout(() => setPurgeStatus(null), 4000);
    } finally {
      setPurging(false);
    }
  };

  const handleCopyPurgeSql = () => {
    const sql = `-- SOFT DELETE & 7 GÜNLÜK KALICI TEMİZLEME SQL
ALTER TABLE public.focus_tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.academic_tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.client_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.quick_notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE OR REPLACE FUNCTION public.purge_old_deleted_records()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    DELETE FROM public.focus_tasks WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    DELETE FROM public.projects WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    DELETE FROM public.courses WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    DELETE FROM public.academic_tasks WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    DELETE FROM public.client_orders WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    DELETE FROM public.content_items WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    DELETE FROM public.transactions WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    DELETE FROM public.quick_notes WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
END;
$$;`;
    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const handleDownloadBackup = () => {
    const data = exportDataJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse-life-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const parsed = JSON.parse(text);
        const ok = importDataJson(text);
        if (ok) {
          const courseCount = Array.isArray(parsed)
            ? parsed.length
            : (Array.isArray(parsed.courses) ? parsed.courses.length : 0);
          const taskCount = Array.isArray(parsed)
            ? 0
            : ((Array.isArray(parsed.academicTasks) ? parsed.academicTasks.length : 0) +
               (Array.isArray(parsed.focusTasks) ? parsed.focusTasks.length : 0));
          const summaryParts = [
            courseCount > 0 ? `${courseCount} ders` : '',
            taskCount > 0 ? `${taskCount} görev` : '',
          ].filter(Boolean);
          setImportStatus(`✓ Başarıyla yüklendi! (${summaryParts.length > 0 ? summaryParts.join(', ') : 'Tüm veriler eşitlendi'})`);
          setImportText('');
        } else {
          setImportStatus('Hata: JSON verisi okunamadı veya biçimi geçersiz.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Sözdizimi hatası';
        setImportStatus(`Hata: Geçersiz JSON dosyası (${msg}).`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportJson = () => {
    if (!importText.trim()) return;
    try {
      const parsed = JSON.parse(importText.trim());
      const ok = importDataJson(importText.trim());
      if (ok) {
        const courseCount = Array.isArray(parsed)
          ? parsed.length
          : (Array.isArray(parsed.courses) ? parsed.courses.length : 0);
        const taskCount = Array.isArray(parsed)
          ? 0
          : ((Array.isArray(parsed.academicTasks) ? parsed.academicTasks.length : 0) +
             (Array.isArray(parsed.focusTasks) ? parsed.focusTasks.length : 0));
        const summaryParts = [
          courseCount > 0 ? `${courseCount} ders` : '',
          taskCount > 0 ? `${taskCount} görev` : '',
        ].filter(Boolean);
        setImportStatus(`✓ Başarıyla yüklendi! (${summaryParts.length > 0 ? summaryParts.join(', ') : 'Tüm veriler eşitlendi'})`);
        setImportText('');
      } else {
        setImportStatus('Hata: JSON verisi aktarılamadı.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sözdizimi hatası';
      setImportStatus(`Hata: Geçersiz JSON verisi (${msg}).`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100"
      style={{
        paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
      }}
    >
      <div className="bg-white dark:bg-[#1e1e1e] border border-[#e5e5e3] dark:border-[#2f2f2f] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7] dark:border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Ayarlar & Veri Yönetimi
              </h3>
              <p className="text-[11px] text-neutral-500">
                PWA mobil bildirimleri, Supabase bulut ve JSON veri aktarımı.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-[#f0f0ee] dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#e9e9e7] dark:border-[#2e2e2e] px-4 sm:px-6 bg-neutral-50/70 dark:bg-[#1a1a1a] gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'general'
                ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>PWA & Bildirimler</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('integrations')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'integrations'
                ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Bulut & API</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'backup'
                ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Veri & İçe Aktarma</span>
          </button>
        </div>

        {/* Tab 1: PWA & Notifications */}
        {activeTab === 'general' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* PWA App Installation & Mode */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#222222] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    PWA Uygulama Durumu
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isStandalone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {isStandalone ? '⚡ Standalone Modu Aktif' : 'Tarayıcı Modu'}
                </span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {isStandalone
                  ? 'Pulse OS şu anda tam ekran bağımsız (standalone) yerel uygulama olarak çalışıyor. Çevrimdışı önbellekleme devrededir.'
                  : 'Pulse OS\'u telefonunuza veya bilgisayarınıza yerel bir uygulama gibi yükleyerek internet olmadan da hızlıca açabilirsiniz.'}
              </p>

              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Pulse OS&apos;u Cihaza Yükle (PWA)</span>
                </button>
              )}

              {!isStandalone && isIos && (
                <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[11px] text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">iPhone Kurulumu:</span> Safari&apos;de alttaki <strong>Paylaş</strong> simgesine dokunup <strong>&ldquo;Ana Ekrana Ekle&rdquo;</strong>yi seçerek tam ekran yerel modda kullanabilirsiniz.
                  </div>
                </div>
              )}
            </div>

            {/* PWA Mobile Daily Notifications */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    PWA Mobil Bildirimler (08:00 & 20:00)
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    notifPerm === 'granted'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {notifPerm === 'granted' ? 'İzin Verildi' : 'İzin Bekleniyor'}
                </span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Telefonunuza sabah 08:00&apos;de günün odak listesini, akşam 20:00&apos;de ise yapılan işlerin
                özet raporunu doğrudan yerel mobil bildirim (Push Notification) olarak iletir.
              </p>

              {notifPerm !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestNotification}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhone / Telefonda Bildirim İznini Aç</span>
                </button>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={morningEnabled}
                        onChange={(e) => {
                          setMorningEnabled(e.target.checked);
                          handleSaveNotificationToggles();
                        }}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>🌅 Sabah 08:00 Günlük Odak Bildirimi</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSendTestNotification('morning')}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Test Et
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eveningEnabled}
                        onChange={(e) => {
                          setEveningEnabled(e.target.checked);
                          handleSaveNotificationToggles();
                        }}
                        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>🌙 Akşam 20:00 Gün Sonu Raporu</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSendTestNotification('evening')}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Test Et
                    </button>
                  </div>

                  {testNotifSent && (
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                      ✓ Test bildirimi telefonunuza gönderildi!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Integrations */}
        {activeTab === 'integrations' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Supabase Connection Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Supabase Bulut Veritabanı
                </h4>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    supabaseConnected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {supabaseConnected ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Bağlı ve Senkronize
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-neutral-400" /> Lokal Mod (Cihazda Saklı)
                    </>
                  )}
                </span>
              </div>

              <form onSubmit={handleTestAndSaveSupabase} className="space-y-2.5">
                <input
                  type="url"
                  placeholder="Supabase URL (https://xyz.supabase.co)"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Supabase Anon Key"
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none font-mono"
                />

                {testResult && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-medium ${
                      testResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={testing || !supabaseUrl || !supabaseKey}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
                  >
                    {testing ? 'Test Ediliyor...' : 'Bağlantıyı Test Et & Kaydet'}
                  </button>
                  {supabaseConnected && (
                    <button
                      type="button"
                      onClick={handleDisconnectSupabase}
                      className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium rounded-lg"
                    >
                      Bağlantıyı Kes
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* GitHub API Token */}
            <div className="pt-4 border-t border-[#f0f0ee] dark:border-[#2a2a2a] space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  GitHub API Entegrasyonu (Opsiyonel)
                </h4>
                {githubSaved && (
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Kaydedildi
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Opsiyonel)"
                  value={githubToken}
                  onChange={(e) => {
                    setGithubToken(e.target.value);
                    setGithubSaved(false);
                  }}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    saveGithubToken(githubToken);
                    setGithubSaved(true);
                  }}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg shrink-0"
                >
                  Kaydet
                </button>
              </div>
            </div>

            {/* YouTube & Instagram */}
            <div className="pt-4 border-t border-[#f0f0ee] dark:border-[#2a2a2a] space-y-4">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube & Instagram Canlı API</span>
              </h4>

              <form onSubmit={handleSaveSocialApis} className="space-y-3">
                {/* YouTube */}
                <div className="p-3 rounded-lg border border-[#e5e5e3] dark:border-[#2f2f2f] bg-[#fafafa] dark:bg-[#252525] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube Data API v3
                    </span>
                    {ytSaved && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Kaydedildi
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="password"
                      placeholder="Google Cloud API Key (AIzaSy...)"
                      value={ytKey}
                      onChange={(e) => {
                        setYtKey(e.target.value);
                        setYtSaved(false);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-white dark:bg-[#1f1f1f] text-neutral-800 dark:text-neutral-200 focus:outline-none font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Kanal ID veya @Handle (@yunus)"
                      value={ytChannel}
                      onChange={(e) => {
                        setYtChannel(e.target.value);
                        setYtSaved(false);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-white dark:bg-[#1f1f1f] text-neutral-800 dark:text-neutral-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="p-3 rounded-lg border border-[#e5e5e3] dark:border-[#2f2f2f] bg-[#fafafa] dark:bg-[#252525] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram Graph API
                    </span>
                    {igSaved && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Kaydedildi
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="password"
                      placeholder="Meta Access Token (EAABsb...)"
                      value={igToken}
                      onChange={(e) => {
                        setIgToken(e.target.value);
                        setIgSaved(false);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-white dark:bg-[#1f1f1f] text-neutral-800 dark:text-neutral-200 focus:outline-none font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Instagram Business Account ID (1784...)"
                      value={igAccount}
                      onChange={(e) => {
                        setIgAccount(e.target.value);
                        setIgSaved(false);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-white dark:bg-[#1f1f1f] text-neutral-800 dark:text-neutral-200 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                  <span className="text-[10px] text-neutral-400">
                    ☁️ Supabase hesabınıza güvenle senkronize edilir, mobilde de otomatik açılır.
                  </span>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-sm transition-all self-end sm:self-auto cursor-pointer"
                  >
                    Sosyal Medya Bilgilerini Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Backup & Import */}
        {activeTab === 'backup' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Status Feedback Banner */}
            {importStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                  importStatus.startsWith('✓') || importStatus.includes('başarıyla')
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {importStatus.startsWith('✓') || importStatus.includes('başarıyla') ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p>{importStatus}</p>
                  {supabaseConnected && (importStatus.startsWith('✓') || importStatus.includes('başarıyla')) && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ☁️ Değişiklikler Supabase bulut veritabanınıza başarıyla senkronize edildi.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Method 1: File Upload */}
            <div className="p-4 rounded-xl border-2 border-dashed border-[#d8d8d6] dark:border-[#383838] bg-[#fafafa] dark:bg-[#222222] text-center space-y-2.5 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors">
              <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  JSON Dosyası İçe Aktar (Hızlı & Kolay)
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                  Bilgisayarınızdaki veya telefonunuzdaki <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[10px]">my-data.json</code> dosyasını seçerek tüm dersleri ve görevleri tek tıkla yükleyin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 inline-flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>JSON Dosyası Seç (.json)</span>
              </button>
            </div>

            {/* Method 2: Paste Raw JSON */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#222222] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    Veya JSON Metnini Doğrudan Yapıştırın
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Dosya seçmek yerine JSON kodunu kopyalayıp aşağıdaki kutucuğa yapıştırabilirsiniz.
                  </p>
                </div>
                {importText && (
                  <button
                    type="button"
                    onClick={() => setImportText('')}
                    className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    Temizle
                  </button>
                )}
              </div>

              <textarea
                rows={5}
                placeholder='{"courses": [...], "academicTasks": [...] } veya [...] formatında JSON verisi yapıştırın...'
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full text-xs font-mono p-3 rounded-lg border border-[#e2e2e0] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />

              <button
                type="button"
                disabled={!importText.trim()}
                onClick={handleImportJson}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Metinden İçe Aktar ve Kaydet</span>
              </button>
            </div>

            {/* Storage Optimization & Soft/Hard Delete */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#222222] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                      Akıllı Çöp Kutusu &amp; Depolama Optimizasyonu
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Soft delete &amp; 7 günlük otomatik kalıcı temizlik
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Uygulamada sildiğiniz dersler veya görevler anında yok edilmez (soft delete). Ancak Supabase bulut veritabanınızda yer kaplamaması için silinme tarihinin üzerinden <strong>1 hafta (7 gün)</strong> geçtikten sonra sistem tarafından otomatik olarak kalıcı (hard delete) olarak tamamen silinir.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleManualPurge}
                  disabled={purging}
                  className="px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] hover:bg-neutral-100 dark:hover:bg-[#252525] text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${purging ? 'animate-spin' : ''}`} />
                  <span>{purging ? 'Temizleniyor...' : '7 Günden Eski Verileri Şimdi Temizle'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyPurgeSql}
                  className="px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] hover:bg-neutral-100 dark:hover:bg-[#252525] text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{sqlCopied ? 'SQL Kopyalandı!' : 'Supabase SQL Kopyala'}</span>
                </button>
              </div>

              {purgeStatus && (
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ {purgeStatus}
                </p>
              )}
            </div>

            {/* Method 3: Backup & Reset */}
            <div className="pt-2 border-t border-[#f0f0ee] dark:border-[#2a2a2a] space-y-2.5">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                Veri Dışa Aktar & Sıfırla
              </h4>
              <p className="text-[11px] text-neutral-500">
                Mevcut verilerinizi tek tıkla JSON yedeği olarak indirebilir veya istediğiniz zaman varsayılan örnek verilere dönebilirsiniz.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#252525] text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON Yedek İndir</span>
                </button>
                <button
                  type="button"
                  onClick={resetToSampleData}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e2e2e0] dark:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#252525] text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Örnek Verileri Yenile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
