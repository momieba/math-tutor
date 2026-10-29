/**
 * Lerninhalte (Wissensbasis). Unabhängig von Nutzerdaten, versioniert, read-only für Clients.
 * Texte dürfen Inline-Mathematik in `$...$` enthalten (Rendering per KaTeX, siehe MathText).
 */

export type Difficulty = 1 | 2 | 3; // 1 = leicht, 2 = mittel, 3 = schwer

export type ExerciseType =
  | 'multiple-choice' // Auswahl einer Option
  | 'numeric' // Zahleneingabe (Dezimalkomma erlaubt)
  | 'equation' // Gleichung lösen / Term umformen (Lösungsmenge oder Term)
  | 'text' // kurze Textantwort
  | 'handwriting'; // Rechenweg auf Schreibfläche + Endergebnis-Feld

export const EXERCISE_TYPES: ExerciseType[] = ['multiple-choice', 'numeric', 'equation', 'text', 'handwriting'];

export type ReviewStatus = 'draft' | 'internal-review' | 'approved';

export interface Curriculum {
  id: string;
  subject: 'Mathematik';
  /** Bundesland-Kürzel oder 'DE' für länderübergreifend (KMK-Bildungsstandards). */
  state: string;
  schoolType: string;
  gradeFrom: number;
  gradeTo: number;
  version: string;
}

/** Ein Schritt eines Lösungswegs. `math` ist optionaler Display-LaTeX (ohne $). */
export interface SolutionStep {
  text: string;
  math?: string;
}

export interface Rule {
  term: string;
  explanation: string;
  math?: string;
}

export interface LearningMaterial {
  id: string;
  kind: 'video' | 'text' | 'link';
  title: string;
  /** null = Platzhalter (noch kein Video vorhanden). */
  url: string | null;
  provider?: 'own' | 'youtube' | 'external';
  durationSec?: number;
}

export interface WorkedExample {
  problem: string;
  steps: SolutionStep[];
  result: string;
}

export interface Choice {
  id: string;
  label: string;
}

/** Erwartete Antwort – maschinell prüfbar. Unabhängig vom Eingabetyp. */
export type ExpectedAnswer =
  | { kind: 'choice'; correct: string }
  | { kind: 'numeric'; value: number; tolerance: number; unit?: string }
  | { kind: 'numeric-set'; values: number[]; tolerance: number } // z. B. Lösungsmenge {3; -5}
  | { kind: 'text'; accepted: string[] }; // Vergleich nach Normalisierung

export interface CommonMistake {
  description: string;
  feedback: string;
  /** Typische falsche Eingaben, die genau diesen Fehler auslösen (optional). */
  answers?: string[];
}

export interface ModelSolution {
  steps: SolutionStep[];
  finalAnswer: string;
  alternative?: SolutionStep[];
}

export interface Exercise {
  id: string;
  subtopicId: string;
  type: ExerciseType;
  difficulty: Difficulty;
  prompt: string;
  choices?: Choice[];
  answer: ExpectedAnswer;
  /** Genau 3 gestufte Hinweise (allgemein → konkret). Danach: Lösung anzeigen. */
  hints: [string, string, string];
  solution: ModelSolution;
  objectives: string[];
  commonMistakes: CommonMistake[];
  /** Optional: Abbildung (später SVG/Bild). */
  figure?: { alt: string; src?: string };
}

export interface Subtopic {
  id: string;
  topicId: string;
  order: number;
  title: string;
  description: string;
  objective: string;
  intro: string;
  rules: Rule[];
  materials: LearningMaterial[];
  example: WorkedExample;
  summary: string[];
  exercises: Exercise[];
}

export interface Topic {
  id: string;
  curriculumId: string;
  subject: 'Mathematik';
  grade: number;
  area: string; // Themengebiet, z. B. Geometrie
  title: string;
  description: string;
  /** Schlüsselwörter/Synonyme für das deterministische Topic-Matching (normalisiert verglichen). */
  keywords: string[];
  reviewStatus: ReviewStatus;
  subtopics: Subtopic[];
}

/** Leichtgewichtige Sicht ohne Kapitelinhalte (für Listen / Dashboard). */
export type TopicSummary = Omit<Topic, 'subtopics'> & { subtopicCount: number; exerciseCount: number };
