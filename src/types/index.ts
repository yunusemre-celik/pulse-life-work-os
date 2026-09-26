export type Priority = 'low' | 'medium' | 'high';

export type MainCategory = 'dev' | 'school' | 'design' | 'content' | 'finance' | 'personal';

export type DayOfWeek =
  | 'Pazartesi'
  | 'Salı'
  | 'Çarşamba'
  | 'Perşembe'
  | 'Cuma'
  | 'Cumartesi'
  | 'Pazar';

export interface FocusTask {
  id: string;
  userId?: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: MainCategory;
  dueDate?: string;
  createdAt: string;
}

export interface SoftwareProject {
  id: string;
  userId?: string;
  name: string;
  description: string;
  category: 'Web App' | 'Mobile App' | 'API / Backend' | 'AI / ML' | 'Araç / Script';
  status: 'Fikir' | 'Geliştirmede' | 'Canlıda' | 'Donduruldu';
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  progress: number; // 0-100
  tasks: { id: string; title: string; completed: boolean }[];
  updatedAt: string;
}

export interface CourseSchedule {
  dayOfWeek: DayOfWeek;
  startTime: string; // Başlangıç Saati (Örn: "09:00")
  endTime?: string; // Bitiş Saati (Örn: "10:50")
  classroom?: string; // Derslik / Sınıf (Örn: BG-05 (78) / Derslik)
  type?: string; // Teori, Uygulama, Laboratuvar vb.
}

export interface AcademicCourse {
  id: string;
  userId?: string;
  name: string;
  code: string;
  instructor?: string;
  classroom?: string; // Derslik / Sınıf (Örn: B-204, Amfi 1)
  dayOfWeek?: DayOfWeek; // Ders Günü
  startTime?: string; // Başlangıç Saati (Örn: "10:30")
  endTime?: string; // Bitiş Saati (Örn: "12:20")
  schedules?: CourseSchedule[]; // Birden fazla ders saati ve amfi desteği
  credits: number;
  ects: number;
  midtermGrade?: number | null;
  finalGrade?: number | null;
  letterGradeGoal?: string;
  status: 'Devam Ediyor' | 'Tamamlandı' | 'Kaldı';
  colorTag?: string;
}

export interface AcademicTask {
  id: string;
  userId?: string;
  courseId?: string;
  courseName: string;
  title: string;
  type: 'Vize' | 'Final' | 'Ödev / Proje' | 'Quiz' | 'Sunum';
  dueDate: string;
  isCompleted: boolean;
  notes?: string;
}

export interface ClientDesignOrder {
  id: string;
  userId?: string;
  clientName: string;
  clientCompany?: string;
  projectTitle: string;
  designType:
    | 'Instagram Post / Carousel'
    | 'Story / Reel Kurgusu'
    | 'Banner / Reklam Görseli'
    | 'Logo & Kurumsal Kimlik'
    | 'UI / Web Tasarımı'
    | 'Diğer';
  status: 'Brief Alındı' | 'Taslak Hazır' | 'Revizede' | 'Onaylandı' | 'Teslim Edildi';
  price: number;
  paidAmount: number;
  paymentStatus: 'Ödendi' | 'Kısmi Ödeme' | 'Bekliyor';
  deliveryDate: string;
  deliveryUrl?: string;
  briefNotes?: string;
}

export interface ContentItem {
  id: string;
  userId?: string;
  title: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok' | 'X' | 'LinkedIn';
  format: 'Reels / Short' | 'Carousel' | 'Post' | 'Uzun Video' | 'Tweet / Thread';
  status: 'Fikir' | 'Senaryo' | 'Görsel / Çekim' | 'Kurguda' | 'Planlandı' | 'Yayınlandı';
  scheduledDate?: string;
  hook?: string;
  notes?: string;
  url?: string;
}

export interface Transaction {
  id: string;
  userId?: string;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  category:
    | 'Tasarım Geliri'
    | 'Freelance Yazılım'
    | 'Burs / Harçlık'
    | 'Diğer Gelir'
    | 'Yazılım & Abonelik'
    | 'Okul & Eğitim'
    | 'Tasarım Kaynakları'
    | 'Kişisel Yaşam';
  date: string;
  notes?: string;
}

export interface QuickNote {
  id: string;
  userId?: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

export interface AppState {
  focusTasks: FocusTask[];
  projects: SoftwareProject[];
  courses: AcademicCourse[];
  academicTasks: AcademicTask[];
  clientOrders: ClientDesignOrder[];
  contentItems: ContentItem[];
  transactions: Transaction[];
  notes: QuickNote[];
}
