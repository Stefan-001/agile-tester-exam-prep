import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabase() {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    supabase = createClient(url, anon);
  }
  return supabase;
}

export type LocalUser = {
  id: string;
  username: string;
  createdAt: string;
};

const LOCAL_USER_KEY = 'agile:user';
const LOCAL_USERS_KEY = 'agile:users';

export async function registerLocal(username: string, password: string) {
  const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}') as Record<string, { id: string; passwordHash: string; createdAt: string }>;
  if (users[username]) throw new Error('Username already exists');
  const id = crypto.randomUUID();
  // Simple hash for demo; do not use in production (Supabase handles real hashing).
  const passwordHash = await simpleHash(password);
  users[username] = { id, passwordHash, createdAt: new Date().toISOString() };
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify({ id, username, createdAt: users[username].createdAt }));
  return { id, username, createdAt: users[username].createdAt };
}

export async function loginLocal(username: string, password: string) {
  const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}') as Record<string, { id: string; passwordHash: string; createdAt: string }>;
  const user = users[username];
  if (!user) throw new Error('Invalid username or password');
  const hash = await simpleHash(password);
  if (hash !== user.passwordHash) throw new Error('Invalid username or password');
  const profile = { id: user.id, username, createdAt: user.createdAt };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
  return profile;
}

export function logoutLocal() {
  localStorage.removeItem(LOCAL_USER_KEY);
}

export function getCurrentLocalUser(): LocalUser | null {
  const raw = localStorage.getItem(LOCAL_USER_KEY);
  return raw ? (JSON.parse(raw) as LocalUser) : null;
}

async function simpleHash(s: string) {
  const enc = new TextEncoder().encode(s);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}