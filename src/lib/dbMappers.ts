import {
  FocusTask,
  SoftwareProject,
  AcademicCourse,
  AcademicTask,
  ClientDesignOrder,
  ContentItem,
  Transaction,
  QuickNote,
} from '@/types';

// ==========================================
// TO DB (JavaScript camelCase -> Supabase snake_case)
// ==========================================

export const toDbTask = (t: FocusTask) => ({
  id: t.id,
  user_id: t.userId,
  title: t.title,
  completed: t.completed,
  priority: t.priority,
  category: t.category,
  due_date: t.dueDate,
  created_at: t.createdAt,
});

export const toDbProject = (p: SoftwareProject) => ({
  id: p.id,
  user_id: p.userId,
  name: p.name,
  description: p.description,
  category: p.category,
  status: p.status,
  tech_stack: p.techStack,
  github_url: p.githubUrl,
  live_url: p.liveUrl,
  progress: p.progress,
  tasks: p.tasks,
  updated_at: p.updatedAt,
});

export const toDbCourse = (c: AcademicCourse) => ({
  id: c.id,
  user_id: c.userId,
  name: c.name,
  code: c.code,
  instructor: c.instructor,
  classroom: c.classroom,
  day_of_week: c.dayOfWeek,
  start_time: c.startTime,
  end_time: c.endTime,
  credits: c.credits,
  ects: c.ects,
  midterm_grade: c.midtermGrade,
  final_grade: c.finalGrade,
  letter_grade_goal: c.letterGradeGoal,
  status: c.status,
  color_tag: c.colorTag,
});

export const toDbAcademicTask = (a: AcademicTask) => ({
  id: a.id,
  user_id: a.userId,
  course_id: a.courseId,
  course_name: a.courseName,
  title: a.title,
  type: a.type,
  due_date: a.dueDate,
  is_completed: a.isCompleted,
  notes: a.notes,
});

export const toDbClientOrder = (o: ClientDesignOrder) => ({
  id: o.id,
  user_id: o.userId,
  client_name: o.clientName,
  client_company: o.clientCompany,
  project_title: o.projectTitle,
  design_type: o.designType,
  status: o.status,
  price: o.price,
  paid_amount: o.paidAmount,
  payment_status: o.paymentStatus,
  delivery_date: o.deliveryDate,
  delivery_url: o.deliveryUrl,
  brief_notes: o.briefNotes,
});

export const toDbContentItem = (c: ContentItem) => ({
  id: c.id,
  user_id: c.userId,
  title: c.title,
  platform: c.platform,
  format: c.format,
  status: c.status,
  scheduled_date: c.scheduledDate,
  hook: c.hook,
  notes: c.notes,
  url: c.url,
});

export const toDbTransaction = (t: Transaction) => ({
  id: t.id,
  user_id: t.userId,
  title: t.title,
  type: t.type,
  amount: t.amount,
  category: t.category,
  date: t.date,
  notes: t.notes,
});

export const toDbNote = (n: QuickNote) => ({
  id: n.id,
  user_id: n.userId,
  title: n.title,
  content: n.content,
  tags: n.tags,
  is_pinned: n.isPinned,
  updated_at: n.updatedAt,
});

// ==========================================
// FROM DB (Supabase snake_case -> JavaScript camelCase)
// ==========================================

export const fromDbTask = (db: any): FocusTask => ({
  id: db.id,
  userId: db.user_id || db.userId,
  title: db.title,
  completed: Boolean(db.completed),
  priority: db.priority || 'medium',
  category: db.category || 'personal',
  dueDate: db.due_date || db.dueDate,
  createdAt: db.created_at || db.createdAt || new Date().toISOString(),
});

export const fromDbProject = (db: any): SoftwareProject => ({
  id: db.id,
  userId: db.user_id || db.userId,
  name: db.name,
  description: db.description || '',
  category: db.category || 'Web App',
  status: db.status || 'Geliştirmede',
  techStack: db.tech_stack || db.techStack || [],
  githubUrl: db.github_url || db.githubUrl,
  liveUrl: db.live_url || db.liveUrl,
  progress: Number(db.progress) || 0,
  tasks: Array.isArray(db.tasks) ? db.tasks : [],
  updatedAt: db.updated_at || db.updatedAt || new Date().toISOString(),
});

export const fromDbCourse = (db: any): AcademicCourse => ({
  id: db.id,
  userId: db.user_id || db.userId,
  name: db.name,
  code: db.code,
  instructor: db.instructor,
  classroom: db.classroom,
  dayOfWeek: db.day_of_week || db.dayOfWeek,
  startTime: db.start_time || db.startTime,
  endTime: db.end_time || db.endTime,
  credits: Number(db.credits) || 3,
  ects: Number(db.ects) || 5,
  midtermGrade: db.midterm_grade ?? db.midtermGrade ?? null,
  finalGrade: db.final_grade ?? db.finalGrade ?? null,
  letterGradeGoal: db.letter_grade_goal || db.letterGradeGoal || 'AA',
  status: db.status || 'Devam Ediyor',
  colorTag: db.color_tag || db.colorTag || 'blue',
});

export const fromDbAcademicTask = (db: any): AcademicTask => ({
  id: db.id,
  userId: db.user_id || db.userId,
  courseId: db.course_id || db.courseId,
  courseName: db.course_name || db.courseName,
  title: db.title,
  type: db.type || 'Ödev / Proje',
  dueDate: db.due_date || db.dueDate,
  isCompleted: Boolean(db.is_completed ?? db.isCompleted),
  notes: db.notes,
});

export const fromDbClientOrder = (db: any): ClientDesignOrder => ({
  id: db.id,
  userId: db.user_id || db.userId,
  clientName: db.client_name || db.clientName,
  clientCompany: db.client_company || db.clientCompany,
  projectTitle: db.project_title || db.projectTitle,
  designType: db.design_type || db.designType,
  status: db.status || 'Brief Alındı',
  price: Number(db.price) || 0,
  paidAmount: Number(db.paid_amount ?? db.paidAmount) || 0,
  paymentStatus: db.payment_status || db.paymentStatus || 'Bekliyor',
  deliveryDate: db.delivery_date || db.deliveryDate,
  deliveryUrl: db.delivery_url || db.deliveryUrl,
  briefNotes: db.brief_notes || db.briefNotes,
});

export const fromDbContentItem = (db: any): ContentItem => ({
  id: db.id,
  userId: db.user_id || db.userId,
  title: db.title,
  platform: db.platform || 'Instagram',
  format: db.format || 'Post',
  status: db.status || 'Fikir',
  scheduledDate: db.scheduled_date || db.scheduledDate,
  hook: db.hook,
  notes: db.notes,
  url: db.url,
});

export const fromDbTransaction = (db: any): Transaction => ({
  id: db.id,
  userId: db.user_id || db.userId,
  title: db.title,
  type: db.type,
  amount: Number(db.amount) || 0,
  category: db.category,
  date: db.date,
  notes: db.notes,
});

export const fromDbNote = (db: any): QuickNote => ({
  id: db.id,
  userId: db.user_id || db.userId,
  title: db.title,
  content: db.content || '',
  tags: Array.isArray(db.tags) ? db.tags : [],
  isPinned: Boolean(db.is_pinned ?? db.isPinned),
  updatedAt: db.updated_at || db.updatedAt || new Date().toISOString(),
});
