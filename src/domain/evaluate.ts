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

/**
 * Listentrenner (gemeinsame Basis für Einzelzahl und Lösungsmenge): Semikolon, „oder“, „und“, Zeilenumbruch.
 * Beim Komma unterscheiden sich die beiden Fälle bewusst:
 * - Lösungsmenge: Komma vor Leerzeichen, Vorzeichen oder Buchstabe trennt („3, 5“ → {3; 5}) (BUG-06).
 * - Einzelzahl: Komma nur vor Variable bzw. Vorzeichen mit Zahl („c = 17, a = 8“, „7, -7“) (BUG-10).
 *   „ 8 , 1 “ bleibt Dezimalkomma, „70,–“ bleibt Preisschreibweise.
 */
const WORD_SEPARATORS = String.raw`;|\boder\b|\bund\b|\bbzw\b\.?|\n`; // „bzw.“ inkl. Punkt (BUG-13: „15 bzw. 17“ ≠ 15,17)
const SET_SEPARATOR = new RegExp(`${WORD_SEPARATORS}|,(?=\\s|[+\\-±]|\\p{L})`, 'iu');
const SINGLE_VALUE_SEPARATOR = new RegExp(`${WORD_SEPARATORS}|,\\s*(?=[+\\-±]\\s*\\d|\\p{L})`, 'iu');

/** Bezeichner am Ende eines Abschnitts vor dem nächsten „=“: „c“, „x2“, „x_1“, „cm“, „cm^2“. */
const TRAILING_IDENTIFIER = /^(.*?)(\p{L}[\p{L}\d_]*(?:\^-?\d+)?)\s*$/su;

/**
 * Erkennt mehrere Aussagen am AUFBAU statt über eine Trennerliste (BUG-12).
 * Bei „a = b = c“ ist jeder innere Abschnitt (b) rechte Seite der einen und linke Seite der nächsten Gleichung.
 * Enthält ein innerer Abschnitt eine Zahl, auf die noch ein Bezeichner bzw. „|“/„&“ folgt
 * („15 bzw. c“, „15 c“, „15 / c“, „15|c“, „15 sowie c“), stehen dort zwei Aussagen ⇒ mehrdeutig.
 * Eindeutig bleiben Gleichungsketten: „c = √289 = 17“, „c = √(64+225) = 17“, „x1 = x2 = 5“ (Index gehört zum Bezeichner).
 * Bewusste Grenze: „c = 17 cm = 0,17 m“ gilt ebenfalls als mehrdeutig (gelbe Rückfrage statt Raten).
 */
function hasMultipleStatements(s: string): boolean {
  const segments = s.split(/[=≈~]/);
  return segments.slice(1, -1).some((seg) => {
    if (/\d[^|&]*[|&]/.test(seg)) return true;
    const m = TRAILING_IDENTIFIER.exec(seg);
    return m !== null && /\d/.test(m[1]);
  });
}

/**
 * In Lösungsmengen beginnt vor jedem „<Variable>(Index)? =“ ein neues Element, sofern davor ein Wert steht
 * („x1=7 x2=-7“ → „x1=7“ und „x2=-7“). Direkt nach „=“ wird nicht geteilt, damit „x1 = x2 = 5“ eine Kette bleibt.
 * Der Bezeichner ist ein einzelner Buchstabe (nicht Ende eines Wortes wie „cm“) mit optionalem Index.
 */
const STATEMENT_START = /(?<=[^=≈~\s])\s*(?=(?<!\p{L})\p{L}(?:_?\d+)?\s*[=≈~])/u;

/**
 * Entscheidung „1.125“ (vorläufig: Koordination nach Empfehlung QA; der Auftraggeber kann das ändern):
 * Genau EIN Punkt mit genau drei Ziffern und ohne Komma ist mehrdeutig. Schulrechner zeigen einen Dezimalpunkt
 * („1.125“ = 1,125), im Deutschen ist es ein Tausenderpunkt (1125). Statt zu raten ⇒ `null` (gelbe Rückfrage).
 * Eindeutig bleiben: mehrere Punktgruppen („1.000.000“), Punkt plus Komma („1.200,50“), führende 0 („0.125“).
 * Auf `false` setzen, um wieder deutsch zu lesen (1.125 → 1125).
 */
const SINGLE_THOUSANDS_DOT_IS_AMBIGUOUS = true;
const SINGLE_THOUSANDS_DOT = /^[+-]?[1-9]\d{0,2}\.\d{3}$/;

/**
 * Eine einzelne Variable direkt an einer Ziffer („2x“, „x5“, „5x^2“) ist ein Term, keine Einheit ⇒ `null`.
 * Mehrbuchstabige Einheiten (cm, kg, Prozent) und Einbuchstaben-Einheiten (m, g, l, s, h) sind nicht betroffen.
 */
const VARIABLE_AT_DIGIT = /\d[abcnpqxyz](?!\p{L})|(?<!\p{L})[abcnpqxyz]\d/iu;

/** Wandelt ein bereinigtes Zahl-Token ohne Leerzeichen um (deutscher und englischer Dezimaltrenner). */
function toNumber(token: string): number | null {
  let t = token;
  if (SINGLE_THOUSANDS_DOT_IS_AMBIGUOUS && SINGLE_THOUSANDS_DOT.test(t)) return null;
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
 * Parst eine einzelne Zahl. Gewertet wird nur der Teil nach dem letzten „=“ bzw. „≈“ (BUG-03: „c = √289 = 17“ → 17),
 * und das nur, wenn die Eingabe keinen Listentrenner enthält (BUG-10: „c = 15 oder c = 17“ ist mehrdeutig ⇒ `null`)
 * und vom Aufbau her nur EINE Aussage ist (BUG-12: „c = 15 bzw. c = 17“, „c = 15 c = 17“, „c=15|c=17“ ⇒ `null`).
 * Einheiten samt Hochzahl (cm², m^3), Währung, Prozent und Füllwörter werden ignoriert.
 * Nicht eindeutige Eingaben (mehrere Werte oder Zahlengruppen, Wurzel, Potenz, Rechenzeichen, Variable an Ziffer,
 * „1.125“) ergeben `null` ⇒ gelbe Rückfrage, statt zu raten. Einfache Brüche aus ganzen Zahlen („5/2“) werden ausgewertet.
 */
export function parseNumber(raw: string): number | null {
  let s = preprocess(raw).trim();
  if (SINGLE_VALUE_SEPARATOR.test(s) || hasMultipleStatements(s)) return null; // BUG-10/12/13
  s = (s.split(/[=≈~]/).pop() ?? '').trim();
  s = s.replace(/[.!]+$/, '').trim(); // Satzpunkt am Ende (BUG-06)
  if (/√|sqrt|wurzel/i.test(s)) return null;
  s = s.replace(APPROX_WORDS, ' ');
  if (VARIABLE_AT_DIGIT.test(s)) return null;
  s = s
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
  if (hasMultipleStatements(part)) return null; // BUG-12: kein „letztes = gewinnt“
  const rhs = (part.split(/[=≈~]/).pop() ?? '').trim().replace(/\+\/?-/g, '±');
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
 * Parst eine Lösungsmenge. Trenner: Semikolon, „oder“, „und“, „bzw.“, Zeilenumbruch, ein neues „<Variable>(Index) =“
 * nach einem Wert (BUG-12: „x1=7 x2=-7“) sowie ein Komma,
 * auf das ein Leerzeichen, eine Variable oder ein Vorzeichen folgt („x1=7, x2=-7“, „7, -7“) (BUG-06).
 * Ein Komma direkt zwischen Ziffern („8,1“) bleibt Dezimalkomma.
 * Nur bewusst leere Mengen („keine Lösung“, „L = {}“, „{}“, „∅“) ergeben `[]`. Eine Eingabe nur aus Trennern
 * („;“, „und“, „,“) ergibt `null` ⇒ gelbe Rückfrage statt Rot (BUG-11).
 */
export function parseNumberSet(raw: string): number[] | null {
  const withoutL = preprocess(raw).trim().replace(/^l\s*=\s*/i, '');
  if (/^\{\s*\}$/.test(withoutL)) return [];
  const t = withoutL.replace(/[{}]/g, '').trim();
  if (/^(keine|leer|∅)/i.test(t)) return [];
  const parts = t
    .split(SET_SEPARATOR)
    .flatMap((p) => p.split(STATEMENT_START)) // „x1=7 x2=-7“ → „x1=7“, „x2=-7“ (BUG-12)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
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
