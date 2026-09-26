-- ==============================================================================
-- PULSE LIFE & WORK OS - PRODUCTION DATABASE SCHEMA
-- ==============================================================================
-- Run this SQL in your Supabase Dashboard -> SQL Editor to automatically create
-- all production tables and Row Level Security (RLS) policies.

-- 1. Bugünün Odak Görevleri Tablosu
CREATE TABLE IF NOT EXISTS public.focus_tasks (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    category TEXT CHECK (category IN ('dev', 'school', 'design', 'content', 'finance', 'personal')) DEFAULT 'personal',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Yazılım Projeleri Tablosu
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('Web App', 'Mobile App', 'API / Backend', 'AI / ML', 'Araç / Script')) DEFAULT 'Web App',
    status TEXT CHECK (status IN ('Fikir', 'Geliştirmede', 'Canlıda', 'Donduruldu')) DEFAULT 'Fikir',
    tech_stack TEXT[] DEFAULT '{}',
    github_url TEXT,
    live_url TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    tasks JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Üniversite / Okul Dersleri Tablosu (Sınıf, Gün ve Saat Bilgisi ile)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    instructor TEXT,
    classroom TEXT, -- Derslik / Sınıf (Örn: B-204, Amfi 1)
    day_of_week TEXT CHECK (day_of_week IN ('Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar')),
    start_time TEXT, -- Başlangıç saati (Örn: "10:30")
    end_time TEXT, -- Bitiş saati (Örn: "12:20")
    credits INTEGER DEFAULT 3,
    ects INTEGER DEFAULT 5,
    midterm_grade NUMERIC,
    final_grade NUMERIC,
    letter_grade_goal TEXT DEFAULT 'AA',
    status TEXT CHECK (status IN ('Devam Ediyor', 'Tamamlandı', 'Kaldı')) DEFAULT 'Devam Ediyor',
    color_tag TEXT DEFAULT 'blue'
);

-- 4. Akademik Sınav & Teslim Görevleri Tablosu
CREATE TABLE IF NOT EXISTS public.academic_tasks (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    course_id TEXT,
    course_name TEXT NOT NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('Vize', 'Final', 'Ödev / Proje', 'Quiz', 'Sunum')) DEFAULT 'Ödev / Proje',
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    notes TEXT
);

-- 5. Müşteri Tasarım Siparişleri (Freelance CRM) Tablosu
CREATE TABLE IF NOT EXISTS public.client_orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    client_name TEXT NOT NULL,
    client_company TEXT,
    project_title TEXT NOT NULL,
    design_type TEXT CHECK (design_type IN ('Instagram Post / Carousel', 'Story / Reel Kurgusu', 'Banner / Reklam Görseli', 'Logo & Kurumsal Kimlik', 'UI / Web Tasarımı', 'Diğer')) DEFAULT 'Instagram Post / Carousel',
    status TEXT CHECK (status IN ('Brief Alındı', 'Taslak Hazır', 'Revizede', 'Onaylandı', 'Teslim Edildi')) DEFAULT 'Brief Alındı',
    price NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    payment_status TEXT CHECK (payment_status IN ('Ödendi', 'Kısmi Ödeme', 'Bekliyor')) DEFAULT 'Bekliyor',
    delivery_date DATE NOT NULL,
    delivery_url TEXT,
    brief_notes TEXT
);

-- 6. Sosyal Medya İçerik Havuzu Tablosu
CREATE TABLE IF NOT EXISTS public.content_items (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('Instagram', 'YouTube', 'TikTok', 'X', 'LinkedIn')) DEFAULT 'Instagram',
    format TEXT CHECK (format IN ('Reels / Short', 'Carousel', 'Post', 'Uzun Video', 'Tweet / Thread')) DEFAULT 'Post',
    status TEXT CHECK (status IN ('Fikir', 'Senaryo', 'Görsel / Çekim', 'Kurguda', 'Planlandı', 'Yayınlandı')) DEFAULT 'Fikir',
    scheduled_date DATE,
    hook TEXT,
    notes TEXT,
    url TEXT
);

-- 7. Finans: Gelir & Gider İşlemleri Tablosu
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT CHECK (category IN ('Tasarım Geliri', 'Freelance Yazılım', 'Burs / Harçlık', 'Diğer Gelir', 'Yazılım & Abonelik', 'Okul & Eğitim', 'Tasarım Kaynakları', 'Kişisel Yaşam')) NOT NULL,
    date DATE NOT NULL,
    notes TEXT
);

-- 8. Hızlı Notlar & Fikir Defteri Tablosu
CREATE TABLE IF NOT EXISTS public.quick_notes (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    title TEXT NOT NULL,
    content TEXT,
    tags TEXT[] DEFAULT '{}',
    is_pinned BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- PRODUCTION ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- Her kullanıcı yalnızca kendi hesabına ait verileri okuyabilir, ekleyebilir ve güncelleyebilir.
-- ==============================================================================

ALTER TABLE public.focus_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

-- 1. focus_tasks RLS
CREATE POLICY "Users can only access own focus_tasks" ON public.focus_tasks
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 2. projects RLS
CREATE POLICY "Users can only access own projects" ON public.projects
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. courses RLS
CREATE POLICY "Users can only access own courses" ON public.courses
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 4. academic_tasks RLS
CREATE POLICY "Users can only access own academic_tasks" ON public.academic_tasks
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 5. client_orders RLS
CREATE POLICY "Users can only access own client_orders" ON public.client_orders
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 6. content_items RLS
CREATE POLICY "Users can only access own content_items" ON public.content_items
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 7. transactions RLS
CREATE POLICY "Users can only access own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 8. quick_notes RLS
CREATE POLICY "Users can only access own quick_notes" ON public.quick_notes
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Hızlı Sorgulama İndeksleri
CREATE INDEX IF NOT EXISTS idx_focus_tasks_user ON public.focus_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_user ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS idx_client_orders_user ON public.client_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
