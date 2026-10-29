/**
 * Deterministisches Topic-Matching: Freitext → Lehrplanthema.
 * Keine KI, keine erfundenen Themen: Ergebnis ist immer ein vorhandenes Thema, eine Auswahl oder „nichts gefunden“.
 * Erweiterung: Bei 'ambiguous'/'none' kann später eine Edge Function (`match-topic`, KI) befragt werden,
 * deren Antwort ebenfalls nur IDs aus dem Lehrplan liefern darf.
 */
import type { Topic } from '../types';

export interface MatchCandidate {
  topicId: string;
  title: string;
  score: number;
  /** Bestes passendes Kapitel, falls die Anfrage spezifisch ist (z. B. „Kathete berechnen“). */
  subtopicId?: string;
}

export type MatchResult =
  | { kind: 'match'; best: MatchCandidate; confidence: number }
  | { kind: 'ambiguous'; candidates: MatchCandidate[] }
  | { kind: 'none'; suggestions: MatchCandidate[] };

const STOPWORDS = new Set(
  'ich du er sie es wir ihr möchte moechte will muss soll kann den die das der des dem ein eine einen einer zu zum zur mit auf für fuer von im in und oder heute lernen verstehen üben ueben mich mir mal bitte wie was wieso warum über ueber eine mathe mathearbeit klassenarbeit arbeit test vorbereiten vorbereitung'.split(
    ' ',
  ),
);

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/²/g, '2')
    .replace(/%/g, ' prozent ')
    .replace(/[^a-z0-9^+=\- ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(' ')
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

/** Token-Vergleich mit einfacher Stammform-Toleranz (Präfix ab 5 Zeichen). */
function tokenMatches(q: string, k: string): boolean {
  if (q === k) return true;
  const min = Math.min(q.length, k.length);
  return min >= 5 && (q.startsWith(k) || k.startsWith(q));
}

export function matchTopic(query: string, topics: Topic[]): MatchResult {
  const nq = ` ${normalize(query)} `;
  const qTokens = tokens(query);
  const all: MatchCandidate[] = topics.map((t) => {
    let score = 0;
    for (const kw of t.keywords) {
      const nk = normalize(kw);
      if (nk.includes(' ')) {
        if (nq.includes(` ${nk} `)) score += 3; // Phrase
      } else if (qTokens.some((q) => tokenMatches(q, nk))) score += 1;
    }
    if (qTokens.some((q) => tokens(t.title).some((k) => tokenMatches(q, k)))) score += 1;

    let subtopicId: string | undefined;
    let bestSub = 0;
    for (const s of t.subtopics) {
      const st = tokens(s.title);
      const hits = qTokens.filter((q) => st.some((k) => tokenMatches(q, k))).length;
      if (hits > bestSub) {
        bestSub = hits;
        subtopicId = s.id;
      }
    }
    if (bestSub > 0) score += 0.5 * bestSub;
    return { topicId: t.id, title: t.title, score, subtopicId: bestSub >= 2 || (bestSub >= 1 && score >= 2) ? subtopicId : undefined };
  });

  const ranked = all.filter((c) => c.score > 0).sort((a, b) => b.score - a.score);
  const [best, second] = ranked;
  if (!best) return { kind: 'none', suggestions: all.slice(0, 5).map((c) => ({ ...c, score: 0, subtopicId: undefined })) };
  const unique = !second || best.score >= 1.5 * second.score;
  if ((best.score >= 2 || (best.score >= 1 && !second)) && unique) {
    return { kind: 'match', best, confidence: Math.min(1, best.score / 4) };
  }
  return { kind: 'ambiguous', candidates: ranked.slice(0, 3) };
}
