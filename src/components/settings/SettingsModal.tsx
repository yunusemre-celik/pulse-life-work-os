'use client';

import React, { useState, useEffect } from 'react';
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
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    state,
    supabaseConnected,
    isSyncing,
    syncWithSupabase,
    exportDataJson,
    importDataJson,
    resetToSampleData,
  } = useApp();

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

  // Backup state
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

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

  const handleSaveSocialApis = (e: React.FormEvent) => {
    e.preventDefault();
    saveYoutubeCredentials(ytKey, ytChannel);
    setYtSaved(true);

    saveInstagramCredentials(igToken, igAccount);
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

  const handleImportJson = () => {
    if (!importText.trim()) return;
    const ok = importDataJson(importText.trim());
    if (ok) {
      setImportStatus('Veriler başarıyla yüklendi!');
      setImportText('');
    } else {
      setImportStatus('Hata: Geçersiz JSON verisi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="bg-white dark:bg-[#1e1e1e] border border-[#e5e5e3] dark:border-[#2f2f2f] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7] dark:border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Ayarlar & API Entegrasyonları
              </h3>
              <p className="text-[11px] text-neutral-500">
                PWA mobil bildirimleri, Supabase bulut, YouTube ve Instagram API yönetimi.
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

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* SECTION 1: PWA Mobile Daily Notifications */}
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

          {/* SECTION 2: YouTube Data API & Instagram Graph API */}
          <div className="space-y-4 pt-2">
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

              <button
                type="submit"
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                Sosyal Medya API Bilgilerini Kaydet
              </button>
            </form>
          </div>

          {/* SECTION 3: Supabase Connection Section */}
          <div className="pt-4 border-t border-[#f0f0ee] dark:border-[#2a2a2a] space-y-3">
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

          {/* SECTION 4: GitHub API Token */}
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

          {/* SECTION 5: Backup & JSON Export */}
          <div className="pt-4 border-t border-[#f0f0ee] dark:border-[#2a2a2a] space-y-2.5">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Veri Yedekleme & Geri Yükleme
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#252525] text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON Yedek İndir</span>
              </button>
              <button
                type="button"
                onClick={resetToSampleData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e2e0] dark:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#252525] text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Örnek Verileri Yenile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
