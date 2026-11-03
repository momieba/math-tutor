// AUTOMATISCH KOPIERT aus src/ durch scripts/sync-functions.mjs – nicht hier bearbeiten.
/**
 * Deterministische Antwortprüfung (Phase 1). Reine Funktion, ohne I/O.
 * Phase 2: Handschrift/Foto-Auswertung per KI liefert zusätzlich Schritt-Markierungen (Correction.marks).
 */
import type { AuthoredExercise, CorrectionMark, ExpectedAnswer, Verdict } from '../types/index.ts';

/** Was die Prüfung von einer Aufgabe braucht: nur der Lösungsschlüssel (läuft lokal und in der Edge Function). */
export type GradableExercise = Pick<AuthoredExercise, 'answer' | 'commonMistakes'>;

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

/**
 * Vorangestellte Beschriftung mit Doppelpunkt („Ergebnis: 17 cm“, „Antwort: 17“, „Lösung: 17“, „c: 17“, „L: 7; -7“)
 * wird entfernt (BUG-14). Sie muss mit einem Buchstaben beginnen, darum bleibt „34 : 40“ eine Division (⇒ `null`).
 * Bewusste Grenze: „x : 2“ wird wie „x: 2“ als Beschriftung gelesen (als Endergebnis-Eingabe unüblich).
 */
const LEADING_LABEL = /^\s*\p{L}[\p{L}\d_]*\s*:\s*/u;

function stripLeadingLabel(s: string): string {
  return s.replace(LEADING_LABEL, '');
}

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
  let s = stripLeadingLabel(preprocess(raw)).trim(); // BUG-14
  if (SINGLE_VALUE_SEPARATOR.test(s) || hasMultipleStatements(s)) return null; // BUG-10/12/13
  s = (s.split(/[=≈~]/).pop() ?? '').trim();
  s = s.replace(/[.!]+$/, '').trim(); // Satzpunkt am Ende (BUG-06)
  if (/√|sqrt|wurzel/i.test(s)) return null;
  s = s.replace(APPROX_WORDS, ' ');
  if (PI_TOKEN.test(s)) return parsePiMultiple(s);
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

/** „π“ oder „pi“ als eigenes Wort (nicht in „Spirale“). */
const PI_TOKEN = /π|(?<!\p{L})pi(?!\p{L})/iu;

/**
 * Vielfaches von π: „25π“, „25 pi“, „25·π cm²“, „π·25“, „-π“, „π“. Genau ein Faktor neben π, sonst `null`
 * („2π·3“, „π/2“ ⇒ Rückfrage). Eine Einheit nach π („π cm²“) wird ignoriert.
 */
function parsePiMultiple(s: string): number | null {
  const parts = s.split(PI_TOKEN);
  if (parts.length !== 2) return null;
  const strip = (t: string) => t.replace(/^\s*[*·⋅]\s*|\s*[*·⋅]\s*$/g, '').trim();
  const before = strip(parts[0]);
  const after = strip(parts[1]);
  const afterHasNumber = /\d/.test(after.replace(/\p{L}+(\^-?\d+)?/gu, '')); // „cm²“ ist keine Zahl
  if (before && afterHasNumber) return null;
  if (/[/:]/.test(before) || /^[/:]/.test(after)) return null;
  const coefText = afterHasNumber ? after : before;
  if (coefText === '' || coefText === '+') return Math.PI;
  if (coefText === '-') return -Math.PI;
  const coef = parseNumber(coefText);
  return coef === null ? null : coef * Math.PI;
}

/**
 * Parst einen Punkt bzw. ein geordnetes Zahlenpaar: „(2|3)“, „S(2|-3)“, „P = (2,5 | 1)“, „(2; 3)“, „(2, 3)“ (Komma mit
 * Leerzeichen), „x = 2, y = 3“, „y = 3 und x = 2“, „L = {(2|3)}“. Ohne Trenner bzw. bei „(2,3)“ (Dezimalkomma?) ⇒ `null`.
 */
export function parsePoint(raw: string): { x: number; y: number } | null {
  const s = preprocess(raw)
    .trim()
    .replace(/^l\s*=\s*/i, '')
    .replace(/[{}]/g, '')
    .trim();
  const named = /^(?:.*?)\b([xy])\s*=\s*(.+?)\s*(?:[;,|]|\bund\b|\s)\s*([xy])\s*=\s*(.+)$/iu.exec(s);
  if (named) {
    const [, n1, v1, n2, v2] = named;
    if (n1.toLowerCase() === n2.toLowerCase()) return null;
    const a = parseNumber(v1);
    const b = parseNumber(v2);
    if (a === null || b === null) return null;
    return n1.toLowerCase() === 'x' ? { x: a, y: b } : { x: b, y: a };
  }
  const inner = /^(?:\p{L}[\p{L}\d_]*\s*=?\s*)?\(\s*(.*?)\s*\)\s*$/su.exec(s)?.[1] ?? s;
  let parts = inner.split(/[|;]/);
  if (parts.length === 1) parts = inner.split(/,\s+/);
  if (parts.length !== 2) return null;
  const x = parseNumber(parts[0]);
  const y = parseNumber(parts[1]);
  return x === null || y === null ? null : { x, y };
}

/**
 * Parst eine lineare Funktionsgleichung in Steigung m und y-Achsenabschnitt b:
 * „y = 2x - 3“, „f(x) = -3 + 2x“, „y = 0,5x“, „y = 1/2x + 1“, „y = x/2“, „y = -x“, „y = 4“, „2x - 3“.
 * Klammern, Potenzen oder andere Variablen ⇒ `null` (Rückfrage).
 */
export function parseLinear(raw: string): { m: number; b: number } | null {
  let s = preprocess(raw)
    .toLowerCase()
    .replace(/[\s*·⋅]/g, '')
    .replace(/\.$/, '');
  s = s.replace(/^(?:y|[a-z]\(x\))=/, '');
  if (!s || /[=^]/.test(s)) return null;
  s = s.replace(/\((\d+(?:[.,]\d+)?\/\d+(?:[.,]\d+)?)\)/g, '$1').replace(/,/g, '.');
  if (/[^\dx.+\-/]/.test(s)) return null;
  const terms = s.match(/[+-]?[^+-]+/g);
  if (!terms) return null;
  let m = 0;
  let b = 0;
  for (const term of terms) {
    const t = /^([+-]?)(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)?(x)?(?:\/(\d+(?:\.\d+)?))?$/.exec(term);
    if (!t) return null;
    const [, sign, coefText, x, divisor] = t;
    if (!coefText && !x) return null;
    if (divisor && !x) return null;
    let coef = 1;
    if (coefText) {
      const [num, den] = coefText.split('/').map(Number);
      if (den === 0) return null;
      coef = den === undefined ? num : num / den;
    }
    if (divisor) {
      if (Number(divisor) === 0) return null;
      coef /= Number(divisor);
    }
    const value = (sign === '-' ? -1 : 1) * coef;
    if (x) m += value;
    else b += value;
  }
  return { m, b };
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
  const withoutL = stripLeadingLabel(preprocess(raw)).trim().replace(/^l\s*=\s*/i, ''); // BUG-14: „Lösung: 7; -7“
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

const close = (a: number, b: number, tolerance: number) => Math.abs(a - b) <= tolerance + 1e-9;

/** Bedeuten zwei Eingaben für das Antwortformat dasselbe? (Für typische Fehler, z. B. „(3|2)“ = „x = 3; y = 2“.) */
function sameInput(kind: ExpectedAnswer['kind'], a: string, b: string): boolean {
  if (normalizeText(a) === normalizeText(b)) return true;
  if (kind === 'numeric') {
    const [x, y] = [parseNumber(a), parseNumber(b)];
    return x !== null && x === y;
  }
  if (kind === 'point') {
    const [p, q] = [parsePoint(a), parsePoint(b)];
    return p !== null && q !== null && close(p.x, q.x, 0) && close(p.y, q.y, 0);
  }
  if (kind === 'linear') {
    const [f, g] = [parseLinear(a), parseLinear(b)];
    return f !== null && g !== null && close(f.m, g.m, 0) && close(f.b, g.b, 0);
  }
  return false;
}

function matchMistake(ex: GradableExercise, raw: string) {
  return ex.commonMistakes.find((m) => (m.answers ?? []).some((a) => sameInput(ex.answer.kind, a, raw)));
}

/** Formatiert eine Zahl für Eingaben im Deutschen: 2.5 → „2,5“ (höchstens 6 Nachkommastellen, ohne Nullen am Ende). */
export function formatInputNumber(n: number): string {
  return String(Math.round(n * 1e6) / 1e6).replace('.', ',');
}

/**
 * Eine Eingabe, die die Prüfung als richtig werten muss (für Inhaltstests und als technische Referenz).
 * Nicht für die Anzeige gedacht: dafür gibt es `ModelSolution.finalAnswer`.
 */
export function canonicalAnswer(a: ExpectedAnswer): string {
  const f = formatInputNumber;
  switch (a.kind) {
    case 'choice':
      return a.correct;
    case 'numeric':
      return f(a.value);
    case 'numeric-set':
      return a.values.length ? a.values.map(f).join('; ') : 'keine Lösung';
    case 'text':
      return a.accepted[0];
    case 'point':
      return `(${f(a.x)}|${f(a.y)})`;
    case 'linear': {
      const b = a.b === 0 ? '' : a.b > 0 ? ` + ${f(a.b)}` : ` - ${f(-a.b)}`;
      return `y = ${f(a.m)}x${b}`;
    }
  }
}

export function evaluateAnswer(ex: GradableExercise, raw: string): EvaluationResult {
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
    case 'point': {
      const p = parsePoint(raw);
      if (p === null) return unclear('Bitte gib den Punkt bzw. die Lösung als Zahlenpaar ein, z. B. (2|-3) oder x = 2; y = -3.');
      points = (Number(close(p.x, a.x, a.tolerance)) + Number(close(p.y, a.y, a.tolerance))) / 2;
      break;
    }
    case 'linear': {
      const g = parseLinear(raw);
      if (g === null) return unclear('Bitte gib die Funktionsgleichung in der Form y = mx + b ein, z. B. y = 2x - 3.');
      points = (Number(close(g.m, a.m, a.tolerance)) + Number(close(g.b, a.b, a.tolerance))) / 2;
      break;
    }
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
export function evaluateHandwriting(ex: GradableExercise, finalAnswer: string, hasDrawing: boolean): EvaluationResult {
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
