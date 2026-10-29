import type { DataMode } from './types';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();
const forced = (import.meta.env.VITE_DATA_MODE ?? '').trim();

export const supabaseConfig = { url, anonKey };

/** Supabase nur, wenn URL + Anon-Key gesetzt sind und nicht explizit 'local' erzwungen wird. */
export const dataMode: DataMode = forced !== 'local' && url.startsWith('http') && anonKey.length > 20 ? 'supabase' : 'local';
