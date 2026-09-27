'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppState,
  FocusTask,
  SoftwareProject,
  AcademicCourse,
  AcademicTask,
  ClientDesignOrder,
  ContentItem,
  Transaction,
  QuickNote,
} from '@/types';
import { INITIAL_DATA } from '@/lib/initialData';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
  toDbTask,
  fromDbTask,
  toDbProject,
  fromDbProject,
  toDbCourse,
  fromDbCourse,
  toDbAcademicTask,
  fromDbAcademicTask,
  toDbClientOrder,
  fromDbClientOrder,
  toDbContentItem,
  fromDbContentItem,
  toDbTransaction,
  fromDbTransaction,
  toDbNote,
  fromDbNote,
} from '@/lib/dbMappers';

const LOCAL_STORAGE_KEY = 'pulse_app_state_v1';
const GUEST_KEY = 'pulse_is_guest_mode';
const SIDEBAR_COLLAPSED_KEY = 'pulse_sidebar_collapsed';

const safeSupabaseCall = async (fn: (client: SupabaseClient) => PromiseLike<unknown>) => {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await fn(supabase);
  } catch (err) {
    console.warn('Supabase sync background notice:', err);
  }
};

interface AppContextType {
  state: AppState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  isSyncing: boolean;
  supabaseConnected: boolean;

  // Sidebar collapse
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;

  // Auth state
  user: User | null;
  isAuthChecking: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Focus tasks
  addFocusTask: (task: Omit<FocusTask, 'id' | 'createdAt'>) => void;
  toggleFocusTask: (id: string) => void;
  deleteFocusTask: (id: string) => void;

  // Projects
  addProject: (project: Omit<SoftwareProject, 'id' | 'updatedAt'>) => void;
  updateProject: (project: SoftwareProject) => void;
  deleteProject: (id: string) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;

  // Courses
  addCourse: (course: Omit<AcademicCourse, 'id'>) => void;
  updateCourse: (course: AcademicCourse) => void;
  deleteCourse: (id: string, code?: string) => void;

  // Academic Tasks
  addAcademicTask: (task: Omit<AcademicTask, 'id'>) => void;
  toggleAcademicTask: (id: string) => void;
  deleteAcademicTask: (id: string) => void;

  // Client Orders
  addClientOrder: (order: Omit<ClientDesignOrder, 'id'>) => void;
  updateClientOrder: (order: ClientDesignOrder) => void;
  deleteClientOrder: (id: string) => void;

  // Content Items
  addContentItem: (item: Omit<ContentItem, 'id'>) => void;
  updateContentItem: (item: ContentItem) => void;
  deleteContentItem: (id: string) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Notes
  addNote: (note: Omit<QuickNote, 'id' | 'updatedAt'>) => void;
  updateNote: (note: QuickNote) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  // Backup & Restore & Storage Optimization
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;
  resetToSampleData: () => void;
  syncWithSupabase: () => Promise<boolean>;
  purgeDeletedRecords: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Clear any legacy guest mode flag to strictly require authentication
      localStorage.removeItem(GUEST_KEY);

      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      }

      // Check sidebar collapsed
      const collapsedStored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (collapsedStored === 'true') {
        setIsSidebarCollapsed(true);
      }

      // Check dark mode
      const savedTheme = localStorage.getItem('pulse_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Helper to sync social credentials between localStorage and Supabase user metadata
  const syncSocialCredentialsWithCloud = async (currentUser: User, client: SupabaseClient) => {
    if (typeof window === 'undefined') return;
    const meta = (currentUser.user_metadata || {}) as Record<string, any>;

    const localIgToken = localStorage.getItem('pulse_instagram_token') || '';
    const localIgAccount = localStorage.getItem('pulse_instagram_account_id') || '';
    const localYtKey = localStorage.getItem('pulse_youtube_api_key') || '';
    const localYtChannel = localStorage.getItem('pulse_youtube_channel_id') || '';

    // 1. Pull from cloud metadata to localStorage if cloud has values
    if (meta.instagram_token && meta.instagram_token !== localIgToken) {
      localStorage.setItem('pulse_instagram_token', meta.instagram_token);
    }
    if (meta.instagram_account_id && meta.instagram_account_id !== localIgAccount) {
      localStorage.setItem('pulse_instagram_account_id', meta.instagram_account_id);
    }
    if (meta.youtube_api_key && meta.youtube_api_key !== localYtKey) {
      localStorage.setItem('pulse_youtube_api_key', meta.youtube_api_key);
    }
    if (meta.youtube_channel_id && meta.youtube_channel_id !== localYtChannel) {
      localStorage.setItem('pulse_youtube_channel_id', meta.youtube_channel_id);
    }

    // 2. If desktop local has them but cloud metadata is empty, automatically upload to cloud
    const updates: Record<string, string> = {};
    if (localIgToken && !meta.instagram_token) updates.instagram_token = localIgToken;
    if (localIgAccount && !meta.instagram_account_id) updates.instagram_account_id = localIgAccount;
    if (localYtKey && !meta.youtube_api_key) updates.youtube_api_key = localYtKey;
    if (localYtChannel && !meta.youtube_channel_id) updates.youtube_channel_id = localYtChannel;

    if (Object.keys(updates).length > 0) {
      try {
        await client.auth.updateUser({
          data: {
            ...meta,
            ...updates,
          },
        });
      } catch (err) {
        console.warn('Auto-push social credentials to Supabase metadata notice:', err);
      }
    }
  };

  // Supabase Auth Check
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsAuthChecking(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          syncSocialCredentialsWithCloud(session.user, supabase);
        }
        setIsAuthChecking(false);
      })
      .catch((err) => {
        console.warn('Auth check notice:', err);
        setIsAuthChecking(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        syncSocialCredentialsWithCloud(session.user, supabase);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [state, isLoaded]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pulse_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pulse_theme', 'light');
      }
      return next;
    });
  };

  // Sidebar Collapse Toggle
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  // Auth Functions
  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase URL ve Anon Key tanımlanmamış. Ayarlardan kontrol edin.' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    setUser(data.user);
    return { success: true };
  };

  const signUp = async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, error: 'Supabase URL ve Anon Key tanımlanmamış. Ayarlardan kontrol edin.' };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    setUser(data.user);
    return { success: true };
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setState(INITIAL_DATA);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem('pulse_github_token');
      localStorage.removeItem('pulse_youtube_api_key');
      localStorage.removeItem('pulse_youtube_channel_id');
      localStorage.removeItem('pulse_instagram_token');
      localStorage.removeItem('pulse_instagram_account_id');
    }
  };

  // Soft delete helper: marks record with deleted_at timestamp
  const softDeleteRecord = async (table: string, id: string) => {
    const now = new Date().toISOString();
    await safeSupabaseCall(async (client) => {
      const { error } = await client.from(table).update({ deleted_at: now }).eq('id', id);
      if (error) {
        // Fallback to direct delete if deleted_at column is not present in Supabase table
        console.warn(`Soft delete update notice on ${table}, falling back to hard delete:`, error.message);
        await client.from(table).delete().eq('id', id);
      }
    });
  };

  // Hard delete helper: permanently deletes soft-deleted records older than 7 days
  const hardDeleteOldRecords = async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const tables = [
      'focus_tasks',
      'projects',
      'courses',
      'academic_tasks',
      'client_orders',
      'content_items',
      'transactions',
      'quick_notes',
    ];

    await safeSupabaseCall(async (client) => {
      for (const table of tables) {
        try {
          await client.from(table).delete().not('deleted_at', 'is', null).lt('deleted_at', sevenDaysAgo);
        } catch {
          // Ignore if column doesn't exist yet
        }
      }
    });
  };

  const purgeDeletedRecords = async (): Promise<{ success: boolean; message: string }> => {
    await hardDeleteOldRecords();
    return {
      success: true,
      message: '7 günden eski silinmiş kayıtlar Supabase veritabanından kalıcı olarak temizlendi.',
    };
  };

  // Supabase sync logic
  const syncWithSupabase = useCallback(async (): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setSupabaseConnected(false);
      return false;
    }

    setIsSyncing(true);
    try {
      // 1. Purge items soft-deleted more than 7 days ago (Hard Delete to save Supabase quota)
      await hardDeleteOldRecords();

      // 2. Fetch all tables
      const { data: dbProjects, error: prjErr } = await supabase.from('projects').select('*');
      if (prjErr) throw prjErr;

      const { data: dbOrders, error: ordErr } = await supabase.from('client_orders').select('*');
      if (ordErr) throw ordErr;

      const { data: dbTasks, error: tskErr } = await supabase.from('focus_tasks').select('*');
      if (tskErr) throw tskErr;

      const { data: dbContent, error: cntErr } = await supabase.from('content_items').select('*');
      if (cntErr) throw cntErr;

      const { data: dbTx, error: txErr } = await supabase.from('transactions').select('*');
      if (txErr) throw txErr;

      const { data: dbNotes, error: ntErr } = await supabase.from('quick_notes').select('*');
      if (ntErr) throw ntErr;

      const { data: dbCourses, error: crsErr } = await supabase.from('courses').select('*');
      if (crsErr) throw crsErr;

      const { data: dbAcadTasks, error: acadErr } = await supabase.from('academic_tasks').select('*');
      if (acadErr) throw acadErr;

      // Filter out soft-deleted items (where deleted_at is set)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filterActive = (arr: any[] | null) => (arr || []).filter((item: any) => !item.deleted_at);

      const activeProjects = filterActive(dbProjects);
      const activeOrders = filterActive(dbOrders);
      const activeTasks = filterActive(dbTasks);
      const activeContent = filterActive(dbContent);
      const activeTx = filterActive(dbTx);
      const activeNotes = filterActive(dbNotes);
      const activeCourses = filterActive(dbCourses);
      const activeAcadTasks = filterActive(dbAcadTasks);

      const hasAnyData =
        activeProjects.length > 0 ||
        activeOrders.length > 0 ||
        activeTasks.length > 0 ||
        activeTx.length > 0 ||
        activeCourses.length > 0 ||
        activeAcadTasks.length > 0 ||
        activeContent.length > 0 ||
        activeNotes.length > 0;

      if (hasAnyData) {
        setState((current) => ({
          ...current,
          focusTasks: activeTasks.length > 0 ? activeTasks.map(fromDbTask) : current.focusTasks,
          projects: activeProjects.length > 0 ? activeProjects.map(fromDbProject) : current.projects,
          clientOrders: activeOrders.length > 0 ? activeOrders.map(fromDbClientOrder) : current.clientOrders,
          contentItems: activeContent.length > 0 ? activeContent.map(fromDbContentItem) : current.contentItems,
          transactions: activeTx.length > 0 ? activeTx.map(fromDbTransaction) : current.transactions,
          notes: activeNotes.length > 0 ? activeNotes.map(fromDbNote) : current.notes,
          courses: activeCourses.length > 0 ? activeCourses.map(fromDbCourse) : current.courses,
          academicTasks: activeAcadTasks.length > 0 ? activeAcadTasks.map(fromDbAcademicTask) : current.academicTasks,
        }));
      }

      setSupabaseConnected(true);
      return true;
    } catch (err) {
      console.warn('Supabase sync warning:', err);
      setSupabaseConnected(false);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Only trigger sync after authentication is established
  useEffect(() => {
    if (isLoaded && user) {
      syncWithSupabase().catch(() => {});
    }
  }, [isLoaded, user, syncWithSupabase]);

  // Focus Tasks CRUD
  const addFocusTask = (task: Omit<FocusTask, 'id' | 'createdAt'>) => {
    const newTask: FocusTask = {
      ...task,
      userId: user?.id,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      focusTasks: [newTask, ...prev.focusTasks],
    }));
    safeSupabaseCall((client) => client.from('focus_tasks').insert(toDbTask(newTask)));
  };

  const toggleFocusTask = (id: string) => {
    setState((prev) => {
      const updated = prev.focusTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      const target = updated.find((t) => t.id === id);
      if (target) {
        safeSupabaseCall((client) => client.from('focus_tasks').update({ completed: target.completed }).eq('id', id));
      }
      return { ...prev, focusTasks: updated };
    });
  };

  const deleteFocusTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      focusTasks: prev.focusTasks.filter((t) => t.id !== id),
    }));
    softDeleteRecord('focus_tasks', id);
  };

  // Projects CRUD
  const addProject = (project: Omit<SoftwareProject, 'id' | 'updatedAt'>) => {
    const newProject: SoftwareProject = {
      ...project,
      userId: user?.id,
      id: `proj-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
    }));
    safeSupabaseCall((client) => client.from('projects').insert(toDbProject(newProject)));
  };

  const updateProject = (project: SoftwareProject) => {
    const updated = { ...project, updatedAt: new Date().toISOString().split('T')[0] };
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === project.id ? updated : p)),
    }));
    safeSupabaseCall((client) => client.from('projects').update(toDbProject(updated)).eq('id', project.id));
  };

  const deleteProject = (id: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
    softDeleteRecord('projects', id);
  };

  const toggleProjectTask = (projectId: string, taskId: string) => {
    setState((prev) => {
      const updatedProjects = prev.projects.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedTasks = proj.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const completedCount = updatedTasks.filter((t) => t.completed).length;
        const progress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
        const modifiedProject = { ...proj, tasks: updatedTasks, progress };
        safeSupabaseCall((client) => client.from('projects').update(toDbProject(modifiedProject)).eq('id', projectId));
        return modifiedProject;
      });
      return { ...prev, projects: updatedProjects };
    });
  };

  // Courses CRUD
  const addCourse = (course: Omit<AcademicCourse, 'id'>) => {
    const newCourse: AcademicCourse = {
      ...course,
      userId: user?.id,
      id: `course-${Date.now()}`,
    };
    setState((prev) => ({ ...prev, courses: [...prev.courses, newCourse] }));
    safeSupabaseCall((client) => client.from('courses').insert(toDbCourse(newCourse)));
  };

  const updateCourse = (course: AcademicCourse) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === course.id ? course : c)),
    }));
    safeSupabaseCall((client) => client.from('courses').update(toDbCourse(course)).eq('id', course.id));
  };

  const deleteCourse = (id: string, code?: string) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => (code ? c.code !== code : c.id !== id)),
    }));
    if (code) {
      safeSupabaseCall(async (client) => {
        const now = new Date().toISOString();
        const { error } = await client.from('courses').update({ deleted_at: now }).eq('code', code);
        if (error) {
          await client.from('courses').delete().eq('code', code);
        }
      });
    } else {
      softDeleteRecord('courses', id);
    }
  };

  // Academic Tasks CRUD
  const addAcademicTask = (task: Omit<AcademicTask, 'id'>) => {
    const newTask: AcademicTask = {
      ...task,
      userId: user?.id,
      id: `acad-${Date.now()}`,
    };
    setState((prev) => ({ ...prev, academicTasks: [...prev.academicTasks, newTask] }));
    safeSupabaseCall((client) => client.from('academic_tasks').insert(toDbAcademicTask(newTask)));
  };

  const toggleAcademicTask = (id: string) => {
    setState((prev) => {
      const updated = prev.academicTasks.map((t) => {
        if (t.id === id) {
          const mod = { ...t, isCompleted: !t.isCompleted };
          safeSupabaseCall((client) => client.from('academic_tasks').update(toDbAcademicTask(mod)).eq('id', id));
          return mod;
        }
        return t;
      });
      return { ...prev, academicTasks: updated };
    });
  };

  const deleteAcademicTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      academicTasks: prev.academicTasks.filter((t) => t.id !== id),
    }));
    softDeleteRecord('academic_tasks', id);
  };

  // Client Orders CRUD
  const addClientOrder = (order: Omit<ClientDesignOrder, 'id'>) => {
    const newOrder: ClientDesignOrder = {
      ...order,
      userId: user?.id,
      id: `ord-${Date.now()}`,
    };
    setState((prev) => ({ ...prev, clientOrders: [newOrder, ...prev.clientOrders] }));
    safeSupabaseCall((client) => client.from('client_orders').insert(toDbClientOrder(newOrder)));
  };

  const updateClientOrder = (order: ClientDesignOrder) => {
    setState((prev) => ({
      ...prev,
      clientOrders: prev.clientOrders.map((o) => (o.id === order.id ? order : o)),
    }));
    safeSupabaseCall((client) => client.from('client_orders').update(toDbClientOrder(order)).eq('id', order.id));
  };

  const deleteClientOrder = (id: string) => {
    setState((prev) => ({
      ...prev,
      clientOrders: prev.clientOrders.filter((o) => o.id !== id),
    }));
    softDeleteRecord('client_orders', id);
  };

  // Content Items CRUD
  const addContentItem = (item: Omit<ContentItem, 'id'>) => {
    const newItem: ContentItem = {
      ...item,
      userId: user?.id,
      id: `cnt-${Date.now()}`,
    };
    setState((prev) => ({ ...prev, contentItems: [newItem, ...prev.contentItems] }));
    safeSupabaseCall((client) => client.from('content_items').insert(toDbContentItem(newItem)));
  };

  const updateContentItem = (item: ContentItem) => {
    setState((prev) => ({
      ...prev,
      contentItems: prev.contentItems.map((c) => (c.id === item.id ? item : c)),
    }));
    safeSupabaseCall((client) => client.from('content_items').update(toDbContentItem(item)).eq('id', item.id));
  };

  const deleteContentItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      contentItems: prev.contentItems.filter((c) => c.id !== id),
    }));
    softDeleteRecord('content_items', id);
  };

  // Transactions CRUD
  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      userId: user?.id,
      id: `tx-${Date.now()}`,
    };
    setState((prev) => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
    safeSupabaseCall((client) => client.from('transactions').insert(toDbTransaction(newTx)));
  };

  const deleteTransaction = (id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
    softDeleteRecord('transactions', id);
  };

  // Notes CRUD
  const addNote = (note: Omit<QuickNote, 'id' | 'updatedAt'>) => {
    const newNote: QuickNote = {
      ...note,
      userId: user?.id,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, notes: [newNote, ...prev.notes] }));
    safeSupabaseCall((client) => client.from('quick_notes').insert(toDbNote(newNote)));
  };

  const updateNote = (note: QuickNote) => {
    const updated = { ...note, updatedAt: new Date().toISOString() };
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === note.id ? updated : n)),
    }));
    safeSupabaseCall((client) => client.from('quick_notes').update(toDbNote(updated)).eq('id', note.id));
  };

  const deleteNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
    softDeleteRecord('quick_notes', id);
  };

  const togglePinNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    }));
  };

  // Backup & Import
  const exportDataJson = () => {
    return JSON.stringify(state, null, 2);
  };

  const importDataJson = (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && ('code' in parsed[0] || 'classroom' in parsed[0])) {
          const nextState: AppState = {
            ...state,
            courses: parsed,
          };
          setState(nextState);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextState));
          safeSupabaseCall(async (supabase) => {
            await supabase
              .from('courses')
              .upsert(parsed.map((c) => ({ ...toDbCourse(c), ...(user?.id ? { user_id: user.id } : {}) })));
          });
          return true;
        }
        return false;
      }
      if (parsed && typeof parsed === 'object') {
        const nextState: AppState = {
          focusTasks: Array.isArray(parsed.focusTasks) ? parsed.focusTasks : (state.focusTasks || []),
          projects: Array.isArray(parsed.projects) ? parsed.projects : (state.projects || []),
          courses: Array.isArray(parsed.courses) ? parsed.courses : (state.courses || []),
          academicTasks: Array.isArray(parsed.academicTasks) ? parsed.academicTasks : (state.academicTasks || []),
          clientOrders: Array.isArray(parsed.clientOrders) ? parsed.clientOrders : (state.clientOrders || []),
          contentItems: Array.isArray(parsed.contentItems) ? parsed.contentItems : (state.contentItems || []),
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : (state.transactions || []),
          notes: Array.isArray(parsed.notes) ? parsed.notes : (state.notes || []),
        };
        setState(nextState);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextState));

        // Sync immediately to Supabase
        safeSupabaseCall(async (supabase) => {
          if (nextState.courses && nextState.courses.length > 0) {
            await supabase
              .from('courses')
              .upsert(nextState.courses.map((c) => ({ ...toDbCourse(c), ...(user?.id ? { user_id: user.id } : {}) })));
          }
          if (nextState.academicTasks && nextState.academicTasks.length > 0) {
            await supabase
              .from('academic_tasks')
              .upsert(nextState.academicTasks.map((t) => ({ ...toDbAcademicTask(t), ...(user?.id ? { user_id: user.id } : {}) })));
          }
          if (nextState.projects && nextState.projects.length > 0) {
            await supabase
              .from('projects')
              .upsert(nextState.projects.map((p) => ({ ...toDbProject(p), ...(user?.id ? { user_id: user.id } : {}) })));
          }
          if (nextState.clientOrders && nextState.clientOrders.length > 0) {
            await supabase
              .from('client_orders')
              .upsert(nextState.clientOrders.map((o) => ({ ...toDbClientOrder(o), ...(user?.id ? { user_id: user.id } : {}) })));
          }
          if (nextState.contentItems && nextState.contentItems.length > 0) {
            await supabase
              .from('content_items')
              .upsert(nextState.contentItems.map((c) => ({ ...toDbContentItem(c), ...(user?.id ? { user_id: user.id } : {}) })));
          }
          if (nextState.transactions && nextState.transactions.length > 0) {
            await supabase
              .from('transactions')
              .upsert(nextState.transactions.map((tx) => ({ ...toDbTransaction(tx), ...(user?.id ? { user_id: user.id } : {}) })));
          }
          if (nextState.notes && nextState.notes.length > 0) {
            await supabase
              .from('quick_notes')
              .upsert(nextState.notes.map((n) => ({ ...toDbNote(n), ...(user?.id ? { user_id: user.id } : {}) })));
          }
          if (nextState.focusTasks && nextState.focusTasks.length > 0) {
            await supabase
              .from('focus_tasks')
              .upsert(nextState.focusTasks.map((t) => ({ ...toDbTask(t), ...(user?.id ? { user_id: user.id } : {}) })));
          }
          setSupabaseConnected(true);
        });

        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetToSampleData = () => {
    setState(INITIAL_DATA);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  };

  return (
    <AppContext.Provider
      value={{
        state,
        activeTab,
        setActiveTab,
        isDark,
        toggleDarkMode,
        isSyncing,
        supabaseConnected,
        isSidebarCollapsed,
        toggleSidebarCollapse,
        user,
        isAuthChecking,
        signIn,
        signUp,
        signOut,
        addFocusTask,
        toggleFocusTask,
        deleteFocusTask,
        addProject,
        updateProject,
        deleteProject,
        toggleProjectTask,
        addCourse,
        updateCourse,
        deleteCourse,
        addAcademicTask,
        toggleAcademicTask,
        deleteAcademicTask,
        addClientOrder,
        updateClientOrder,
        deleteClientOrder,
        addContentItem,
        updateContentItem,
        deleteContentItem,
        addTransaction,
        deleteTransaction,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        exportDataJson,
        importDataJson,
        resetToSampleData,
        syncWithSupabase,
        purgeDeletedRecords,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
