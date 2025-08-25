import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = (url && anon)
  ? createClient(url, anon)
  : null;

// Simple helpers and graceful fallbacks when no Supabase configured
export async function signInWithMagicLink(email: string) {
  if (!supabase) return { error: 'Supabase not configured' };
  return supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + (process.env.NEXT_PUBLIC_BASE_PATH || '') : undefined } });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}