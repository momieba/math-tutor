import type { DataMode } from './types';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
const forced = (import.meta.env.VITE_DATA_MODE ?? '').trim();

export const supabaseConfig = { url, anonKey };

const supabaseConfigured = url.startsWith('http') && anonKey.length > 20;

/** Supabase nur, wenn URL + Anon-Key gesetzt sind und nicht explizit 'local' erzwungen wird. */
export const dataMode: DataMode = forced !== 'local' && supabaseConfigured ? 'supabase' : 'local';

/**
 * Production-Builds speichern nie still im Browser: Fehlt die Supabase-Konfiguration, zeigt die App einen
 * Konfigurationsfehler. Der lokale Modus (Demo, E2E-Tests) muss im Build ausdrücklich mit VITE_DATA_MODE=local gewählt werden.
 */
export const configError: string | null =
  import.meta.env.PROD && dataMode === 'local' && forced !== 'local'
    ? 'VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY fehlen in diesem Build. Für eine reine Demo ohne Cloud VITE_DATA_MODE=local setzen.'
    : null;
