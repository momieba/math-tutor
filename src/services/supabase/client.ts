import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config';

let client: SupabaseClient | null = null;

/** Lazy: wird nur im Supabase-Modus erzeugt. Nutzt ausschließlich den öffentlichen Anon-Key. */
export function getSupabase(): SupabaseClient {
  client ??= createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export const SUBMISSIONS_BUCKET = 'submissions';
