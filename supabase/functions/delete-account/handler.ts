/**
 * Löscht das eigene Konto endgültig (DSGVO Art. 17): zuerst alle Bilder im Bucket `submissions/<uid>/`,
 * dann den Auth-Nutzer. Alle Tabellen hängen per `on delete cascade` an auth.users und verschwinden mit.
 * Ohne Deno-Abhängigkeiten; die echte Verdrahtung steht in index.ts.
 */
import { json, requireUser, serveJson, type ResolveUser } from '../_shared/http.ts';

export interface DeleteAccountDeps {
  resolveUser: ResolveUser;
  /** Pfade aller Bilder des Nutzers (`<uid>/<datei>`). */
  listImages(userId: string): Promise<string[]>;
  removeImages(paths: string[]): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}

const BATCH = 100;

export function createDeleteAccountHandler(deps: DeleteAccountDeps): (req: Request) => Promise<Response> {
  return serveJson(async (req) => {
    const userId = await requireUser(req, deps.resolveUser);
    const images = await deps.listImages(userId);
    for (let i = 0; i < images.length; i += BATCH) await deps.removeImages(images.slice(i, i + BATCH));
    await deps.deleteUser(userId);
    return json({ deleted: true, images: images.length });
  });
}
