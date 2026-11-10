import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config';

let client: Promise<SupabaseClient> | null = null;

/**
 * Lazy und per dynamischem Import: supabase-js liegt in einem eigenen Chunk und wird erst beim ersten Zugriff geladen
 * (nie im lokalen Modus, und die Landingpage rendert, ohne darauf zu warten). Nutzt ausschließlich den öffentlichen Anon-Key.
 */
export function getSupabase(): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    }),
  );
  return client;
}

/**
 * Fehlerklassen der Edge-Function-Aufrufe am Namen erkennen statt per `instanceof`, damit kein Wert-Import aus
 * supabase-js nötig ist (der würde die Bibliothek wieder ins Hauptbundle ziehen).
 */
export function isFunctionsError(error: unknown, name: 'FunctionsHttpError' | 'FunctionsFetchError'): error is Error & { context: unknown } {
  return error instanceof Error && error.name === name;
}

export const SUBMISSIONS_BUCKET = 'submissions';
