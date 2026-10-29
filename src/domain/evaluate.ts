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

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};

/**
 * Gemeinsame Vorverarbeitung für Text- und Zahlenprüfung.
 * Reihenfolge ist wichtig (BUG-01): Hochzahlen werden VOR `normalize('NFKC')` zu `^n`,
 * weil NFKC aus „²“ sonst eine normale „2“ macht („a²“ → „a2“).
 * Alle Strich-Varianten (Halbgeviert, Geviert, Ziffernstrich, Unicode-Minus) werden zu „-“ (BUG-05).
 */
function preprocess(raw: string): string {
  return raw
    .replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => '^' + Array.from(m, (c) => SUPERSCRIPT_DIGITS[c]).join(''))
    .normalize('NFKC') // u. a. tiefgestellte Indizes: x₁ → x1
    .replace(/[–—‒−]/g, '-');
}

/** Normalisiert Text/Term-Eingaben: klein, ohne Leerzeichen, ² → ^2, Mal-Zeichen entfernt. */
export function normalizeText(raw: string): string {
  return preprocess(raw)
    .toLowerCase()
    .replace(/[\s*·⋅]/g, '')
    .replace(/["„“'`.]/g, '');
}

/** Zeichen, die wie Einheiten ignoriert werden (Währung, Prozent, Grad, Anführungszeichen). */
const IGNORED_SYMBOLS = /[€$%°"„“'`]/g;
/** Füllwörter für Näherungen: „ca. 8,1“, „etwa 8,1“. */
const APPROX_WORDS = /(^|\s)(ca|circa|etwa|ungefähr|rund)\.?(?=\s|\d|$)/gi;

/** Wandelt ein bereinigtes Zahl-Token ohne Leerzeichen um (deutscher und englischer Dezimaltrenner). */
function toNumber(token: string): number | null {
  let t = token;
  if (/^[+-]?[1-9]\d{0,2}(\.\d{3})+(,\d+)?$/.test(t)) {
    t = t.replace(/\./g, '').replace(',', '.'); // deutscher Tausenderpunkt (BUG-04): 1.000 → 1000, 1.200,5 → 1200.5
  } else {
    if (t.includes(',') && t.includes('.')) return null; // z. B. „1,234.5“: nicht eindeutig
    t = t.replace(',', '.');
  }
  if (!/^[+-]?(\d+(\.\d+)?|\.\d+)$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parst eine einzelne Zahl. Gewertet wird nur der Teil nach dem letzten „=“ bzw. „≈“ (BUG-03: „c = √289 = 17“ → 17).
 * Einheiten samt Hochzahl (cm², m^3), Währung, Prozent und Füllwörter werden ignoriert.
 * Nicht eindeutige Eingaben (mehrere Zahlengruppen, Wurzel, Potenz, Rechenzeichen) ergeben `null` ⇒ gelbe Rückfrage,
 * statt Ziffern zusammenzukleben. Einfache Brüche aus ganzen Zahlen („5/2“) werden ausgewertet.
 */
export function parseNumber(raw: string): number | null {
  let s = preprocess(raw).trim();
  s = (s.split(/[=≈~]/).pop() ?? '').trim();
  s = s.replace(/[.!]+$/, '').trim(); // Satzpunkt am Ende (BUG-06)
  if (/√|sqrt|wurzel/i.test(s)) return null;
  s = s
    .replace(APPROX_WORDS, ' ')
    .replace(/,\s*-+(?!\s*\d)/g, '') // Preisschreibweise „70,–“ (BUG-06)
    .replace(/\p{L}+(\^-?\d+)?/gu, ' ') // Einheiten/Wörter inkl. Hochzahl: cm^2, m^3, Prozent
    .replace(IGNORED_SYMBOLS, ' ')
    .replace(/\s*([.,/])\s*/g, '$1') // „8 , 1“ → „8,1“
    .replace(/([+-])\s+/g, '$1')
    .trim();
  if (!s || /\s/.test(s)) return null; // leer oder mehrere Zahlengruppen
  const frac = /^([+-]?\d+)\/(\d+)$/.exec(s);
  if (frac) {
    const den = Number(frac[2]);
    return den === 0 ? null : Number(frac[1]) / den;
  }
  return toNumber(s);
}

/** Ein Element einer Lösungsmenge; „±a“ bzw. „b ± a“ ergibt zwei Werte (BUG-02). */
function parseSetPart(part: string): number[] | null {
  const rhs = (part.split(/[=≈]/).pop() ?? '').trim().replace(/\+\/?-/g, '±');
  const pm = /^(.*?)±(.+)$/.exec(rhs);
  if (!pm) {
    const n = parseNumber(part);
    return n === null ? null : [n];
  }
  const base = pm[1].trim() === '' ? 0 : parseNumber(pm[1]);
  const delta = parseNumber(pm[2]);
  if (base === null || delta === null) return null;
  return delta === 0 ? [base] : [base + delta, base - delta];
}

/**
 * Parst eine Lösungsmenge. Trenner: Semikolon, „oder“, „und“, Zeilenumbruch sowie ein Komma,
 * auf das ein Leerzeichen, eine Variable oder ein Vorzeichen folgt („x1=7, x2=-7“, „7, -7“) (BUG-06).
 * Ein Komma direkt zwischen Ziffern („8,1“) bleibt Dezimalkomma.
 */
export function parseNumberSet(raw: string): number[] | null {
  const t = preprocess(raw).trim().replace(/^l\s*=\s*/i, '').replace(/[{}]/g, '');
  if (/^(keine|leer|∅)/i.test(t)) return [];
  const parts = t
    .split(/;|\boder\b|\bund\b|\n|,(?=\s|[+\-±]|\p{L})/iu)
    .map((p) => p.trim())
    .filter(Boolean);
  const nums: number[] = [];
  for (const p of parts) {
    const values = parseSetPart(p);
    if (values === null) return null;
    nums.push(...values);
  }
  return nums;
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
