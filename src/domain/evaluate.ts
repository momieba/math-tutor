/**
 * Deterministische Antwortprüfung (Phase 1). Reine Funktion, ohne I/O.
 * Phase 2: Handschrift/Foto-Auswertung per KI liefert zusätzlich Schritt-Markierungen (Correction.marks).
 */
import type { CorrectionMark, Exercise, Verdict } from '../types';

export interface EvaluationResult {
  verdict: Verdict;
  points: number; // 0..1
  feedback: string;
  marks: CorrectionMark[];
  /** Beschreibung eines erkannten typischen Fehlers. */
  mistake?: string;
}

/** Normalisiert Text/Term-Eingaben: klein, ohne Leerzeichen, ² → ^2, Mal-Zeichen entfernt. */
export function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFKC')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/[\s*·⋅]/g, '')
    .replace(/["„“'`.]/g, '');
}

/** Parst eine Zahl mit deutschem oder englischem Dezimaltrenner. Einheiten/Prozentzeichen werden ignoriert. */
export function parseNumber(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/^[a-z]\w*\s*=\s*/i, '') // "x = 5", "c=17"
    .replace(/[^\d,.\-−+]/g, '')
    .replace('−', '-')
    .replace(',', '.');
  if (!/^[+-]?\d+(\.\d+)?$/.test(cleaned) && !/^[+-]?\.\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Parst eine Lösungsmenge: Trennung per Semikolon, „oder“, „und“ oder Zeilenumbruch. */
export function parseNumberSet(raw: string): number[] | null {
  const t = raw.trim().replace(/^l\s*=\s*/i, '').replace(/[{}]/g, '');
  if (/^(keine|leer|∅)/i.test(t)) return [];
  const parts = t.split(/;|\boder\b|\bund\b|\n/i).map((p) => p.trim()).filter(Boolean);
  const nums = parts.map(parseNumber);
  return nums.every((n): n is number => n !== null) ? nums : null;
}

function matchMistake(ex: Exercise, raw: string) {
  const n = normalizeText(raw);
  const num = parseNumber(raw);
  return ex.commonMistakes.find((m) =>
    (m.answers ?? []).some((a) => normalizeText(a) === n || (num !== null && parseNumber(a) === num && ex.answer.kind === 'numeric')),
  );
}

export function evaluateAnswer(ex: Exercise, raw: string): EvaluationResult {
  const a = ex.answer;
  const unclear = (msg: string): EvaluationResult => ({ verdict: 'unclear', points: 0, feedback: msg, marks: [{ color: 'yellow', message: msg }] });
  if (!raw.trim()) return unclear('Keine Antwort erkannt.');

  let points = 0;
  switch (a.kind) {
    case 'choice':
      points = raw === a.correct ? 1 : 0;
      break;
    case 'numeric': {
      const n = parseNumber(raw);
      if (n === null) return unclear('Die Eingabe ist nicht eindeutig als Zahl lesbar. Bitte nur das Ergebnis eingeben, z. B. 8,1.');
      points = Math.abs(n - a.value) <= a.tolerance + 1e-9 ? 1 : 0;
      break;
    }
    case 'numeric-set': {
      const got = parseNumberSet(raw);
      if (got === null) return unclear('Bitte gib die Lösungen als Zahlen getrennt durch Semikolon ein, z. B. 3; -5.');
      const remaining = [...a.values];
      let hits = 0;
      let extras = 0;
      for (const g of got) {
        const i = remaining.findIndex((v) => Math.abs(v - g) <= a.tolerance + 1e-9);
        if (i >= 0) {
          hits++;
          remaining.splice(i, 1);
        } else extras++;
      }
      points = a.values.length === 0 ? (got.length === 0 ? 1 : 0) : Math.max(0, (hits - extras) / a.values.length);
      break;
    }
    case 'text':
      points = a.accepted.map(normalizeText).includes(normalizeText(raw)) ? 1 : 0;
      break;
  }

  if (points === 1) return { verdict: 'correct', points, feedback: 'Richtig!', marks: [{ color: 'green', message: 'Ergebnis korrekt.' }] };
  const mistake = matchMistake(ex, raw);
  const feedback = mistake?.feedback ?? (points > 0 ? 'Teilweise richtig – es fehlt noch etwas.' : 'Das stimmt noch nicht. Nutze einen Hinweis oder prüfe deinen Rechenweg.');
  return {
    verdict: points > 0 ? 'partial' : 'incorrect',
    points: Math.round(points * 100) / 100,
    feedback,
    marks: [{ color: points > 0 ? 'yellow' : 'red', message: feedback }],
    mistake: mistake?.description,
  };
}

export const UNCHECKED_WORK_MESSAGE =
  'Dein Rechenweg ist gespeichert, wird im MVP aber noch nicht automatisch geprüft. Vergleiche ihn selbst mit der Musterlösung.';

/**
 * Handschrift-Aufgaben (Phase 1): Geprüft wird nur das eingetippte Endergebnis.
 * Der Rechenweg auf der Schreibfläche ist nicht maschinell gelesen ⇒ immer eine gelbe Markierung, nie ein grünes „Weg korrekt“.
 * Ohne Endergebnis gibt es keine Bewertung (`unclear`), statt eine unsichere Korrektur anzuzeigen (Konzept §8/§9).
 * Phase 2: KI-Auswertung (Edge Function `grade-submission`) ersetzt die gelbe Markierung durch Schritt-Markierungen.
 */
export function evaluateHandwriting(ex: Exercise, finalAnswer: string, hasDrawing: boolean): EvaluationResult {
  if (!finalAnswer.trim()) {
    const msg = hasDrawing
      ? 'Handschrift wird noch nicht automatisch gelesen. Bitte trage dein Endergebnis in das Feld unter der Schreibfläche ein.'
      : 'Keine Antwort erkannt.';
    return { verdict: 'unclear', points: 0, feedback: msg, marks: [{ color: 'yellow', message: msg }] };
  }
  const base = evaluateAnswer(ex, finalAnswer);
  if (base.verdict === 'unclear') return base;
  const workMark: CorrectionMark = hasDrawing
    ? { color: 'yellow', message: UNCHECKED_WORK_MESSAGE }
    : { color: 'yellow', message: 'Du hast keinen Rechenweg aufgeschrieben – geprüft wurde nur das Endergebnis.' };
  return { ...base, marks: [...base.marks, workMark] };
}
