# AGENT.MD — PULSE LIFE & WORK OS ARCHITECTURE & AGENT GUIDELINES

> **Repository Type**: Production Personal Life & Work OS (PWA + Cloud Sync)  
> **Last Verification**: 2026-09-26  

---

## 1. Project Purpose & Philosophy
**Pulse Life & Work OS** is a hyper-personalized, minimalist Notion-like central dashboard created for **Yunus Emre**. It brings together:
1. **Software Projects (`/projects`)**: Tracking repositories, tech stacks, live/GitHub URLs, and real-time commit streams via GitHub API.
2. **Academic & School Management (`/school`)**: Course tracking (ECTS credits, classroom/amphi locations, class schedule times), exam/assignment countdowns, and automated **15-minute pre-class push alerts**.
3. **Freelance Design CRM (`/clients`)**: Client deliverables, order statuses, payments received vs. pending, and Figma/Drive links.
4. **Social Media & Creator Hub (`/content`)**: Content pipelines (YouTube, Instagram Reels, TikTok, X) with real-time API performance widgets.
5. **Finance & Cash Flow (`/finance`)**: Income/expense transaction ledgers, net balance metrics, and interactive category donut/pie breakdown charts.
6. **Quick Notes & Idea Scratchpad (`/notes`)**: Tagged and pinned markdown-style memos.
7. **Daily Focus & Dashboard (`/dashboard`)**: Morning priority task list, cross-workspace aggregate stats, and urgent delivery warnings.

---

## 2. Directory Structure & Key Files

```text
├── public/
│   ├── icon-192.png, icon-512.png # PWA app icons
│   ├── manifest.json              # Web app manifest for iOS / Android install
│   └── sw.js                      # Service worker for push notifications & offline caching
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with viewport-fit=cover & SW registration
│   │   ├── page.tsx               # Main application container (minimalist header, active tab renderer)
│   │   └── globals.css            # Notion minimalist styling, dark mode classes
│   ├── components/
│   │   ├── auth/AuthScreen.tsx    # Supabase email/password login & Guest Mode entry
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # Desktop collapsible navigation bar
│   │   │   └── BottomNav.tsx      # iPhone 12 ergonomic 7-tab bottom bar
│   │   ├── dashboard/DashboardView.tsx # Overview dashboard & focus tasks
│   │   ├── projects/              # Software projects & GitHub widget
│   │   ├── school/                # Courses, classroom badges, exam countdowns
│   │   ├── clients/               # Freelance orders & payment statuses
│   │   ├── content/               # Content pipeline & YouTube/Instagram API widgets
│   │   ├── finance/               # Income/Expense ledger & Interactive Donut Chart
│   │   ├── notes/                 # Quick notes & ideas
│   │   ├── modals/                # QuickAddModal.tsx (contextual item creator)
│   │   └── settings/SettingsModal.tsx # Supabase, GitHub & Social Media API keys & Backup
│   ├── context/
│   │   └── AppContext.tsx         # Unified global state provider & background Supabase sync
│   ├── lib/
│   │   ├── dbMappers.ts           # Bidirectional snake_case <-> camelCase database mapper
│   │   ├── initialData.ts         # Production blank state (EMPTY ARRAYS - ZERO MOCK DATA)
│   │   ├── notifications.ts       # PWA notification engine (08:00, 20:00 & 15m pre-class)
│   │   ├── supabaseClient.ts      # Supabase client singleton & credential persistence
│   │   ├── github.ts              # GitHub REST API integration for real-time commits
│   │   ├── youtube.ts             # YouTube Data API v3 subscriber & view fetcher
│   │   └── instagram.ts           # Instagram Graph API metrics fetcher
│   └── types/
│       └── index.ts               # Core TypeScript interface definitions
├── supabase_schema.sql            # Complete database schema + Row Level Security (RLS)
├── agent.md                       # This developer/agent guide
└── README.md                      # Deployment instructions for Vercel & GitHub
```

---

## 3. Data Integrity & "Blank Slate" Rule

> [!IMPORTANT]
> **Strict Blank Slate Requirement**:
> All demo and sample mock items have been removed from `src/lib/initialData.ts`. When this application is deployed or launched for the first time, all arrays (`focusTasks`, `projects`, `courses`, `academicTasks`, `clientOrders`, `contentItems`, `transactions`, `notes`) must remain clean empty arrays (`[]`).
> The user will add real personal data in dedicated subsequent sessions. Do NOT add mock or seed data without explicit user request!

---

## 4. Supabase Architecture & Production Security

- **Primary User Model**: Authenticated user session bound via Supabase Auth UUID (`auth.uid()`)
- **Tables**:
  1. `public.focus_tasks`
  2. `public.projects`
  3. `public.courses` (includes `classroom`, `day_of_week`, `start_time`, `end_time`)
  4. `public.academic_tasks`
  5. `public.client_orders`
  6. `public.content_items`
  7. `public.transactions`
  8. `public.quick_notes`
- **Row Level Security (RLS)**:
  - Enabled on **all 8 tables**.
  - Policies enforce `(auth.uid() = user_id OR user_id IS NULL)`.
  - Authenticated queries automatically bind to the logged-in user's UUID.
- **Model Mapping (`src/lib/dbMappers.ts`)**:
  - Automatically translates TypeScript camelCase model properties to PostgreSQL snake_case table columns (e.g. `dayOfWeek` <-> `day_of_week`, `startTime` <-> `start_time`, `deliveryDate` <-> `delivery_date`, etc.).
  - Always route Supabase calls through `toDb...` when writing and `fromDb...` when querying.

---

## 5. Automated Notification Engine (`src/lib/notifications.ts`)

The app runs automated background checks every 60 seconds (`setInterval` in `src/app/page.tsx`):
1. **15 Minutes Before Class**:
   - `checkPreClassNotifications(state)` inspects today's day of week (`Pazartesi`, `Salı`, etc.) and the course's `startTime`.
   - When `diffMinutes` is between 13 and 16 minutes, it triggers a native push notification:
     - Title: `🔔 Ders Başlıyor: [Ders Adı]`
     - Body: `[Ders Kodu] dersiniz 15 dakika sonra saat [Saat]'te ([Sınıf] dersliği) başlıyor!`
   - Prevents duplicate alerts per day using `localStorage` keys (`pulse_class_[id]_[date]`).
2. **08:00 Morning Focus Report**:
   - Compiles today's pending focus tasks, high-priority work, client orders due today, and exams.
3. **20:00 Evening Review Report**:
   - Congratulates the user on completed tasks and summarizes what remains for tomorrow.

---

## 6. Mobile PWA & iPhone 12 Ergonomics

1. **Viewport & Safe Areas**:
   - Layout sets `viewport-fit=cover` and `<meta name="apple-mobile-web-app-capable" content="yes">`.
   - Bottom navigation respects `env(safe-area-inset-bottom, 16px)` to avoid interfering with the iOS home indicator bar.
2. **7-Tab Bottom Bar (`src/components/layout/BottomNav.tsx`)**:
   - Specifically sized for 390px width (iPhone 12 display) with active tab indicators and badge counts.
3. **No Redundant Global Quick-Add Button**:
   - Per user directive, the floating global "Hızlı Ekle" button has been removed from both mobile and desktop views to maintain a clean aesthetic. Each section maintains its own contextual add actions.

---

## 7. Guidelines for Future AI Agents

1. **Preserve Database Compatibility**: If altering schemas, always update both `supabase_schema.sql`, `src/types/index.ts`, and `src/lib/dbMappers.ts`.
2. **RLS Policy Safety**: Never drop RLS or create unauthenticated public write policies.
3. **TypeScript Strictness**: Always run `npm run build` after making changes to verify zero TypeScript or Next.js build errors.
4. **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - In addition, users can configure API keys dynamically in the Settings modal stored securely in client `localStorage`.
