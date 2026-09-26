import { AppState } from '@/types';

export interface NotificationSettings {
  enabled: boolean;
  morningEnabled: boolean;
  morningTime: string; // "08:00"
  eveningEnabled: boolean;
  eveningTime: string; // "20:00"
}

const SETTINGS_KEY = 'pulse_notification_settings';
const LAST_MORNING_KEY = 'pulse_last_morning_notif_date';
const LAST_EVENING_KEY = 'pulse_last_evening_notif_date';

export function isNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (err) {
    console.error('Notification permission request error:', err);
    return false;
  }
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return {
      enabled: false,
      morningEnabled: true,
      morningTime: '08:00',
      eveningEnabled: true,
      eveningTime: '20:00',
    };
  }

  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {}
  }

  return {
    enabled: true,
    morningEnabled: true,
    morningTime: '08:00',
    eveningEnabled: true,
    eveningTime: '20:00',
  };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

export async function sendPwaNotification(
  title: string,
  body: string,
  tag: string = 'pulse-general'
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const swReg = await navigator.serviceWorker.ready;
    if (swReg && 'showNotification' in swReg) {
      await swReg.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag,
        data: { url: '/' },
      } as any);
      return true;
    } else {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        tag,
      });
      return true;
    }
  } catch (e) {
    console.warn('Native notification trigger warning:', e);
    return false;
  }
}

// 1. Morning 08:00 Focus Report Generator
export function generateMorningReport(state: AppState): { title: string; body: string } {
  const pendingTasks = state.focusTasks.filter((t) => !t.completed);
  const highPriority = pendingTasks.filter((t) => t.priority === 'high');
  const todayStr = new Date().toISOString().split('T')[0];

  const dueOrders = state.clientOrders.filter(
    (o) => o.deliveryDate === todayStr && o.status !== 'Teslim Edildi'
  );
  const dueAcad = state.academicTasks.filter(
    (t) => t.dueDate === todayStr && !t.isCompleted
  );

  let body = '';
  if (pendingTasks.length === 0) {
    body = 'Bugün için planlanmış bekleyen görev yok. Harika bir gün dileriz!';
  } else {
    body = `Bugün tamamlanacak ${pendingTasks.length} görev var.`;
    if (highPriority.length > 0) {
      body += ` Öncelik: "${highPriority[0].title.slice(0, 45)}..."`;
    }
    if (dueOrders.length > 0) {
      body += ` ⚠️ Bugün teslim edilecek ${dueOrders.length} müşteri tasarımı var!`;
    }
    if (dueAcad.length > 0) {
      body += ` 🎓 Bugün ${dueAcad[0].title} ödev/sınav günü!`;
    }
  }

  return {
    title: '🌅 Günaydın! Günün Odak Listesi',
    body,
  };
}

// 2. Evening 20:00 Daily Summary Report Generator
export function generateEveningReport(state: AppState): { title: string; body: string } {
  const completedTasks = state.focusTasks.filter((t) => t.completed);
  const remainingTasks = state.focusTasks.filter((t) => !t.completed);

  let body = '';
  if (completedTasks.length > 0) {
    body = `Tebrikler! Bugün ${completedTasks.length} adet odak görevini tamamladın.`;
    if (remainingTasks.length > 0) {
      body += ` Kalan ${remainingTasks.length} görev yarına aktarıldı.`;
    } else {
      body += ' Günlük tüm görevlerini bitirdin, iyi dinlenmeler!';
    }
  } else {
    body = `Bugün henüz tamamlanan görev kaydedilmedi (${remainingTasks.length} görev beklemede). Yarın yeni bir gün!`;
  }

  return {
    title: '🌙 Gün Sonu Özeti & Raporu',
    body,
  };
}

// 3. 15-Minute Pre-Class Notification Checker
export function checkPreClassNotifications(state: AppState): void {
  if (typeof window === 'undefined') return;
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const now = new Date();
  const days: Array<'Pazar' | 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi'> = [
    'Pazar',
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
  ];
  const todayDay = days[now.getDay()];
  const todayDateString = now.toISOString().split('T')[0];
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  state.courses.forEach((course) => {
    if (course.dayOfWeek === todayDay && course.startTime) {
      const [cH, cM] = course.startTime.split(':').map(Number);
      if (!isNaN(cH) && !isNaN(cM)) {
        const courseTotalMinutes = cH * 60 + cM;
        const diffMinutes = courseTotalMinutes - currentTotalMinutes;

        // If class is in ~15 minutes (between 13 and 16 minutes window)
        if (diffMinutes >= 13 && diffMinutes <= 16) {
          const notifKey = `pulse_class_${course.id}_${todayDateString}`;
          if (!localStorage.getItem(notifKey)) {
            const classroomInfo = course.classroom ? ` (${course.classroom} dersliği)` : '';
            sendPwaNotification(
              `🔔 Ders Başlıyor: ${course.name}`,
              `${course.code} dersiniz 15 dakika sonra saat ${course.startTime}'te${classroomInfo} başlıyor!`,
              `pulse-course-${course.id}`
            );
            localStorage.setItem(notifKey, 'sent');
          }
        }
      }
    }
  });
}

// 4. Automated Daily Checker (Runs Every Minute)
export function checkAndTriggerDailyNotifications(state: AppState): void {
  if (typeof window === 'undefined') return;
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const currentHour = now.getHours();
  const todayDateString = now.toISOString().split('T')[0];

  const [morningH] = settings.morningTime.split(':').map(Number);
  const [eveningH] = settings.eveningTime.split(':').map(Number);

  // Check 15-Minute Pre-Class Notifications
  checkPreClassNotifications(state);

  // Check Morning (fires between e.g. 08:00 and 11:59 if not fired today)
  if (settings.morningEnabled && currentHour >= morningH && currentHour < 12) {
    const lastMorningDate = localStorage.getItem(LAST_MORNING_KEY);
    if (lastMorningDate !== todayDateString) {
      const report = generateMorningReport(state);
      sendPwaNotification(report.title, report.body, 'pulse-morning');
      localStorage.setItem(LAST_MORNING_KEY, todayDateString);
    }
  }

  // Check Evening (fires between e.g. 20:00 and 23:59 if not fired today)
  if (settings.eveningEnabled && currentHour >= eveningH) {
    const lastEveningDate = localStorage.getItem(LAST_EVENING_KEY);
    if (lastEveningDate !== todayDateString) {
      const report = generateEveningReport(state);
      sendPwaNotification(report.title, report.body, 'pulse-evening');
      localStorage.setItem(LAST_EVENING_KEY, todayDateString);
    }
  }
}
