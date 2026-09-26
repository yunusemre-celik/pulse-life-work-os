'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Settings,
  Check,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { getSupabaseCredentials } from '@/lib/supabaseClient';

interface AuthScreenProps {
  onOpenSettings: () => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
const STORAGE_ATTEMPTS_KEY = 'pulse_auth_failed_attempts';
const STORAGE_LOCKOUT_KEY = 'pulse_auth_lockout_until';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onOpenSettings }) => {
  const { signIn } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bot Protection States
  const [honeypot, setHoneypot] = useState(''); // Invisible trap for bots
  const [renderTimestamp] = useState<number>(Date.now()); // Fast-fill heuristic
  const [isHumanVerified, setIsHumanVerified] = useState(false); // Interactive check
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  const creds = getSupabaseCredentials();
  const isSupabaseConfigured = Boolean(creds.url && creds.key);

  // Check lockout on mount and handle countdown timer
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = Number(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0');
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutRemaining(0);
        localStorage.removeItem(STORAGE_LOCKOUT_KEY);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFailedAttempt = () => {
    const current = Number(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || '0') + 1;
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, String(current));

    if (current >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_SECONDS * 1000;
      localStorage.setItem(STORAGE_LOCKOUT_KEY, String(lockUntil));
      localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
      setLockoutRemaining(LOCKOUT_SECONDS);
      setErrorMsg(`Çok fazla hatalı deneme yapıldı. Güvenliğiniz için ${LOCKOUT_SECONDS} saniye kilitlendi.`);
    } else {
      setErrorMsg(`Hatalı giriş! Kalan deneme hakkı: ${MAX_ATTEMPTS - current}`);
    }
  };

  const handleSuccessfulAttempt = () => {
    localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
    localStorage.removeItem(STORAGE_LOCKOUT_KEY);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMsg(null);

    // 1. Bot Protection: Honeypot check
    if (honeypot.trim().length > 0) {
      // Automated bot detected via hidden field
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setErrorMsg('Güvenlik doğrulaması başarısız oldu (Automated bot detected).');
      }, 1000);
      return;
    }

    // 2. Bot Protection: Timing heuristic (too fast submission)
    const timeToSubmit = Date.now() - renderTimestamp;
    if (timeToSubmit < 800) {
      setErrorMsg('Giriş isteği olağandışı hızda iletildi. Lütfen tekrar deneyin.');
      return;
    }

    // 3. Bot Protection: Human verification checkbox
    if (!isHumanVerified) {
      setErrorMsg('Lütfen robot olmadığınızı doğrulamak için güvenlik kutucuğunu işaretleyin.');
      return;
    }

    setLoading(true);
    const res = await signIn(email.trim(), password);
    setLoading(false);

    if (res.success) {
      handleSuccessfulAttempt();
    } else {
      handleFailedAttempt();
      if (!res.error?.includes('kilitlendi')) {
        setErrorMsg(res.error || 'Giriş yapılamadı. E-posta veya şifrenizi kontrol edin.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#fbfbfa] dark:bg-[#141414] select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#1e1e1e] border border-[#e5e5e3] dark:border-[#2f2f2f] rounded-2xl shadow-xl p-8 space-y-6 animate-in fade-in duration-200 relative overflow-hidden">
        {/* Subtle Security Badge */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 border-b border-[#f0f0ee] dark:border-[#2a2a2a] pb-3">
          <span className="flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Korumalı Güvenli Giriş</span>
          </span>
          <span className="font-mono text-[10px]">RLS & Anti-Bot v2</span>
        </div>

        {/* Logo and Header */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex w-12 h-12 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 items-center justify-center font-bold text-lg shadow-sm">
            P
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Pulse Life & Work OS
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Yetkili kullanıcı girişi ile komuta merkezine bağlanın.
          </p>
        </div>

        {/* Supabase Config Warning if keys not found */}
        {!isSupabaseConfigured && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Supabase Bağlantısı Yapılandırılmadı</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Giriş yapabilmek için Supabase URL ve Anon Key tanımlanmış olmalıdır.
            </p>
            <button
              onClick={onOpenSettings}
              className="text-[11px] font-bold text-amber-900 dark:text-amber-200 underline flex items-center gap-1"
            >
              <Settings className="w-3 h-3" /> Bilgileri Yapılandır
            </button>
          </div>
        )}

        {/* Lockout Warning */}
        {lockoutRemaining > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5">
              <div className="font-semibold">Çok Sayıda Hatalı Deneme Yapıldı</div>
              <p className="text-[11px]">
                Güvenlik kilidi devrede. Yeniden denemek için{' '}
                <strong className="font-mono text-rose-800 dark:text-rose-200">{lockoutRemaining} saniye</strong>{' '}
                bekleyin.
              </p>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {errorMsg && lockoutRemaining === 0 && (
          <div className="p-3 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot Trap Field (Invisible to Humans, Read by Automated Bots) */}
          <div style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}>
            <label htmlFor="b_trap_val">Do not fill this field</label>
            <input
              type="text"
              id="b_trap_val"
              name="b_trap_val"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              <span>E-Posta Adresi</span>
            </label>
            <input
              type="email"
              required
              disabled={loading || lockoutRemaining > 0}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 disabled:opacity-50 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Şifre</span>
            </label>
            <input
              type="password"
              required
              disabled={loading || lockoutRemaining > 0}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#e2e2e0] dark:border-[#333] bg-[#fafafa] dark:bg-[#252525] text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 disabled:opacity-50 transition-all"
            />
          </div>

          {/* Bot Protection: Interactive Human Verification Checkbox */}
          <div
            onClick={() => {
              if (lockoutRemaining === 0) {
                setIsHumanVerified((prev) => !prev);
                setErrorMsg(null);
              }
            }}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
              isHumanVerified
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                : 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  isHumanVerified
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                }`}
              >
                {isHumanVerified && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className="text-xs font-medium">Ben robot değilim</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
              <ShieldCheck className={`w-4 h-4 ${isHumanVerified ? 'text-emerald-500' : 'text-neutral-400'}`} />
              <span>Anti-Bot Shield</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || lockoutRemaining > 0 || !isHumanVerified}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900 animate-spin" />
                <span>Doğrulanıyor...</span>
              </div>
            ) : (
              <>
                <span>Giriş Yap</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="pt-2 text-center">
          <span className="text-[10px] text-neutral-400 block">
            Bu sisteme yalnızca yetkili hesap bilgileriyle giriş yapılabilir.
          </span>
        </div>
      </div>
    </div>
  );
};
