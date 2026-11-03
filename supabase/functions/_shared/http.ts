/**
 * HTTP-Helfer für die Edge Functions (ohne Deno-Abhängigkeiten, damit die Handler testbar bleiben).
 * CORS ist offen: Die Functions authentifizieren per Bearer-Token (kein Cookie), fremde Seiten erreichen damit nichts.
 */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' } });
}

/** Fehler mit Meldung für den Schüler. Alles andere wird als 500 ohne Details beantwortet und nur geloggt. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Liefert die Nutzer-ID zum Bearer-Token oder `null` (abgelaufen/ungültig). */
export type ResolveUser = (accessToken: string) => Promise<string | null>;

export async function requireUser(req: Request, resolve: ResolveUser): Promise<string> {
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  const userId = token ? await resolve(token) : null;
  if (!userId) throw new HttpError(401, 'Deine Anmeldung ist abgelaufen. Bitte melde dich erneut an.');
  return userId;
}

/** Gemeinsamer Rahmen: CORS-Preflight, nur POST, Fehler in JSON übersetzen. */
export function serveJson(handler: (req: Request) => Promise<Response>): (req: Request) => Promise<Response> {
  return async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    if (req.method !== 'POST') return json({ error: 'Nur POST erlaubt.' }, 405);
    try {
      return await handler(req);
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status);
      console.error(e);
      return json({ error: 'Auf dem Server ist ein Fehler aufgetreten. Bitte versuche es später erneut.' }, 500);
    }
  };
}
