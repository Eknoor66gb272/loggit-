
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, WorkEntry, MonthSummary, VerificationRecord, DesignProject } from '../types';
import { INITIAL_USERS } from '../constants';

const SUPABASE_URL = 'https://xgoyheiziovmknjsumuf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gWAHUcUWl9hLksslA-4lyg_7vRYrVYD';

const supabaseUrl = (process.env.SUPABASE_URL || SUPABASE_URL).trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || SUPABASE_KEY).trim();

let supabase: SupabaseClient | null = null;
let connectionState: 'connected' | 'local' | 'connecting' = 'connecting';

if (supabaseUrl && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true }
    });
  } catch (e) {
    console.error("[STORAGE] Supabase Client Init Error:", e);
    connectionState = 'local';
  }
}

const LOCAL_KEYS = {
  USERS: 'loggit_v4_users',
  ENTRIES: 'loggit_v4_entries',
  VERIFICATIONS: 'loggit_v4_verifications',
  PROJECTS: 'loggit_v4_projects'
};

export const storageService = {
  async init() {
    this.initLocal();
    if (supabase) {
      try {
        // Precise Table Verification
        const { data: users, error } = await supabase.from('users').select('id').limit(1);
        
        // If the table doesn't exist, Supabase returns a 404/42P01 error
        if (error) {
          console.warn("[DB] Tables missing or RLS blocking. Using Local Engine.");
          connectionState = 'local';
          return;
        }
        
        connectionState = 'connected';
        console.log("[DB] High Precision Cloud Link Established.");

        if (!users || users.length === 0) {
          console.log("[DB] Initializing Personnel Registry...");
          await supabase.from('users').insert(INITIAL_USERS);
        }
      } catch (err) {
        console.warn("[DB] Network or Schema error. Falling back to Local Cache.");
        connectionState = 'local';
      }
    } else {
      connectionState = 'local';
    }
  },

  getConnectionStatus() {
    return connectionState;
  },

  initLocal() {
    if (!localStorage.getItem(LOCAL_KEYS.USERS)) localStorage.setItem(LOCAL_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    if (!localStorage.getItem(LOCAL_KEYS.ENTRIES)) localStorage.setItem(LOCAL_KEYS.ENTRIES, JSON.stringify([]));
    if (!localStorage.getItem(LOCAL_KEYS.VERIFICATIONS)) localStorage.setItem(LOCAL_KEYS.VERIFICATIONS, JSON.stringify([]));
    if (!localStorage.getItem(LOCAL_KEYS.PROJECTS)) localStorage.setItem(LOCAL_KEYS.PROJECTS, JSON.stringify([]));
  },

  async getUsers(): Promise<User[]> {
    if (supabase && connectionState === 'connected') {
      const { data, error } = await supabase.from('users').select('*').order('fullName', { ascending: true });
      if (!error && data) return data;
    }
    return JSON.parse(localStorage.getItem(LOCAL_KEYS.USERS) || '[]');
  },

  async getEntries(): Promise<WorkEntry[]> {
    if (supabase && connectionState === 'connected') {
      const { data, error } = await supabase.from('entries').select('*').order('date', { ascending: false });
      if (!error && data) return data;
    }
    return JSON.parse(localStorage.getItem(LOCAL_KEYS.ENTRIES) || '[]');
  },

  async addEntry(entry: WorkEntry) {
    if (supabase && connectionState === 'connected') {
      await supabase.from('entries').upsert([entry]);
    }
    const entries = JSON.parse(localStorage.getItem(LOCAL_KEYS.ENTRIES) || '[]');
    const existingIdx = entries.findIndex((e: any) => e.id === entry.id);
    if (existingIdx !== -1) entries[existingIdx] = entry;
    else entries.push(entry);
    localStorage.setItem(LOCAL_KEYS.ENTRIES, JSON.stringify(entries));
  },

  async deleteEntry(id: string) {
    if (supabase && connectionState === 'connected') {
      await supabase.from('entries').delete().eq('id', id);
    }
    const entries = JSON.parse(localStorage.getItem(LOCAL_KEYS.ENTRIES) || '[]');
    localStorage.setItem(LOCAL_KEYS.ENTRIES, JSON.stringify(entries.filter((e: any) => e.id !== id)));
  },

  async setVerification(userId: string, monthYear: string, isVerified: boolean) {
    if (supabase && connectionState === 'connected') {
      await supabase.from('verifications').upsert([{ userId, monthYear, isVerified }], { onConflict: 'userId,monthYear' });
    }
    const vers = await this.getVerifications();
    const idx = vers.findIndex(v => v.userId === userId && v.monthYear === monthYear);
    if (idx !== -1) vers[idx].isVerified = isVerified;
    else vers.push({ userId, monthYear, isVerified });
    localStorage.setItem(LOCAL_KEYS.VERIFICATIONS, JSON.stringify(vers));
  },

  async getVerifications(): Promise<VerificationRecord[]> {
    if (supabase && connectionState === 'connected') {
      const { data } = await supabase.from('verifications').select('*');
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem(LOCAL_KEYS.VERIFICATIONS) || '[]');
  },

  async isMonthVerified(userId: string, dateStr: string): Promise<boolean> {
    const [year, month] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
    const vers = await this.getVerifications();
    return vers.find(v => v.userId === userId && v.monthYear === monthYear)?.isVerified || false;
  },

  async addUser(user: Partial<User>) {
    const newUser = { 
      id: Math.random().toString(36).substr(2, 9), 
      role: 'EMPLOYEE' as const, 
      status: 'active' as const, 
      isActive: true, 
      isPasswordSet: false, 
      isArchived: false, 
      ...user 
    };
    if (supabase && connectionState === 'connected') {
      await supabase.from('users').insert([newUser]);
    }
    const users = await this.getUsers();
    users.push(newUser as User);
    localStorage.setItem(LOCAL_KEYS.USERS, JSON.stringify(users));
  },

  async updateUser(id: string, updates: Partial<User>) {
    if (supabase && connectionState === 'connected') {
      await supabase.from('users').update(updates).eq('id', id);
    }
    const users = JSON.parse(localStorage.getItem(LOCAL_KEYS.USERS) || '[]');
    const idx = users.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem(LOCAL_KEYS.USERS, JSON.stringify(users));
    }
  },

  async deleteUser(id: string) {
    if (supabase && connectionState === 'connected') {
      await supabase.from('users').delete().eq('id', id);
    }
    const users = JSON.parse(localStorage.getItem(LOCAL_KEYS.USERS) || '[]');
    localStorage.setItem(LOCAL_KEYS.USERS, JSON.stringify(users.filter((u: any) => u.id !== id)));
  },

  async setUserPassword(id: string, password: string) {
    await this.updateUser(id, { password, isPasswordSet: true });
  },

  async saveProject(project: DesignProject) {
    if (supabase && connectionState === 'connected') {
      await supabase.from('projects').upsert([project]);
    }
    const projects = await this.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx !== -1) projects[idx] = project;
    else projects.push(project);
    localStorage.setItem(LOCAL_KEYS.PROJECTS, JSON.stringify(projects));
  },

  async getProjects(): Promise<DesignProject[]> {
    if (supabase && connectionState === 'connected') {
      const { data } = await supabase.from('projects').select('*').order('updatedAt', { ascending: false });
      if (data) return data;
    }
    return JSON.parse(localStorage.getItem(LOCAL_KEYS.PROJECTS) || '[]');
  },

  getSummariesFromEntries(entries: WorkEntry[], verifications: VerificationRecord[], userId: string): MonthSummary[] {
    const groups: Record<string, WorkEntry[]> = {};
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    entries.forEach(e => {
      if (!e.date) return;
      const parts = e.date.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const key = `${months[month-1]} ${year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });

    return Object.entries(groups).map(([monthYear, monthEntries]) => {
      const isVerified = verifications.find(r => r.userId === userId && r.monthYear === monthYear)?.isVerified || false;
      return {
        monthYear,
        entries: monthEntries.sort((a,b) => b.date.localeCompare(a.date)),
        totalHours: monthEntries.reduce((sum, e) => sum + (Number(e.totalHours) || 0), 0),
        isVerified
      };
    }).sort((a, b) => {
        const [am, ay] = a.monthYear.split(' ');
        const [bm, by] = b.monthYear.split(' ');
        if (ay !== by) return parseInt(by) - parseInt(ay);
        return months.indexOf(bm) - months.indexOf(am);
    });
  }
};
