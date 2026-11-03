import type { AttemptSubmissionService, DraftRepository, GradingService } from '../types';

/**
 * Abgabe mit Ausfallsicherung (Konzept §23: „keine Schülerlösung darf verloren gehen“).
 * Ablauf: bewerten + speichern → Erfolg: evtl. alten Entwurf entfernen. Fehler: Eingabe als Entwurf sichern und Fehler melden.
 * Eine Rückfrage (`unclear`) ist kein Fehler: Es wird nichts gespeichert, ein vorhandener Entwurf bleibt erhalten.
 * Der Entwurf wird bewusst erst im Fehlerfall geschrieben: Im lokalen Modus würde ein vorheriger Entwurf
 * mit Bild sonst denselben (knappen) localStorage-Platz belegen, den die eigentliche Speicherung braucht.
 */
export function createAttemptSubmissionService(grading: GradingService, drafts: DraftRepository): AttemptSubmissionService {
  return {
    async submit(input) {
      try {
        const outcome = await grading.grade(input);
        if (outcome.status === 'saved') await drafts.remove(input.userId, input.exerciseId);
        return { ok: true, outcome };
      } catch (e) {
        const error = describeError(e);
        const { saved, imageDropped } = await drafts.save({ input, savedAt: new Date().toISOString(), lastError: error });
        return { ok: false, error, draftSaved: saved, imageDropped };
      }
    },
    getPending: (userId, exerciseId) => drafts.get(userId, exerciseId),
    discardPending: (userId, exerciseId) => drafts.remove(userId, exerciseId),
  };
}

export function describeError(e: unknown): string {
  if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
    return 'Der lokale Speicher des Browsers ist voll. Lösche alte Daten oder nutze die Cloud-Version.';
  }
  if (e instanceof TypeError && /fetch|network/i.test(e.message)) return 'Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.';
  return e instanceof Error && e.message ? e.message : 'Unbekannter Fehler beim Speichern.';
}
