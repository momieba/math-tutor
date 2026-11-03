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

/** Was eine Aufgabe verlangt (unabhängig vom Antwortformat), angelehnt an die Anforderungsbereiche der KMK-Bildungsstandards. */
export type Requirement =
  | 'knowledge' // Begriffe, Definitionen, Regeln wiedergeben
  | 'calculation' // Verfahren ausführen, rechnen
  | 'application' // Sach- und Textaufgaben, Modellieren
  | 'reasoning' // begründen, prüfen, argumentieren
  | 'construction'; // zeichnen, konstruieren, ablesen

export type Checkpoint = 'formula' | 'concept';

export const REQUIREMENTS: Requirement[] = ['knowledge', 'calculation', 'application', 'reasoning', 'construction'];

/**
 * Abweichender Schweregrad für ein Bundesland und/oder eine Schulart. Ohne `state` gilt der Eintrag in allen Ländern.
 * `difficulty: null` ⇒ die Aufgabe wird dort nicht angeboten. Grundwert ist `Exercise.difficulty` (NRW-Gymnasium).
 */
export interface ExerciseLevel {
  state?: string;
  schoolType: string;
  difficulty: Difficulty | null;
}

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
  | { kind: 'text'; accepted: string[] } // Vergleich nach Normalisierung
  | { kind: 'point'; x: number; y: number; tolerance: number } // geordnetes Paar, z. B. Schnittpunkt (2|3) oder LGS-Lösung
  | { kind: 'linear'; m: number; b: number; tolerance: number }; // Funktionsgleichung y = mx + b

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

/** Eingabeformat einer Aufgabe – ohne die Lösung (für das Antwortfeld: Zahl mit Einheit, Lösungsmenge, …). */
export interface AnswerFormat {
  kind: ExpectedAnswer['kind'];
  unit?: string;
}

/**
 * Aufgabe, wie der Client sie sieht. Enthält bewusst KEINE Lösung: Antwort, Hinweise, Musterlösung und
 * typische Fehler liegen im `ExerciseKey` und kommen nur über den Bewertungsdienst (services.grading).
 */
export interface Exercise {
  id: string;
  subtopicId: string;
  type: ExerciseType;
  requirement: Requirement;
  /** Schweregrad für NRW-Gymnasium; das Content-Repository ersetzt ihn durch den Wert für Land und Schulart des Nutzers. */
  difficulty: Difficulty;
  levels?: ExerciseLevel[];
  /** Teil des Formel-Checks im Lernpfad (Schritt 3): Formel abfragen bzw. zentrale Begriffe. */
  checkpoint?: Checkpoint;
  prompt: string;
  choices?: Choice[];
  answerFormat: AnswerFormat;
  objectives: string[];
  figure?: Figure;
}

/** Abbildung zu einer Aufgabe. `alt` ist Pflicht (Barrierefreiheit); gezeichnet wird deklarativ als SVG. */
export type Figure =
  | { kind?: undefined; alt: string; src?: string }
  | {
      kind: 'coordinate-plane';
      alt: string;
      /** Sichtbarer Ausschnitt, z. B. [-5, 5]. */
      x: [number, number];
      y: [number, number];
      lines?: { m: number; b: number; label?: string }[];
      points?: { x: number; y: number; label?: string }[];
    }
  | {
      kind: 'circle';
      alt: string;
      /** Ausschnitt mit Mittelpunktswinkel in Grad (fehlt ⇒ Vollkreis). */
      angle?: number;
      /** Innenradius als Anteil des Außenradius (Kreisring), z. B. 0.6. */
      inner?: number;
      /** Beschriftungen, z. B. { r: 'r = 4 cm' }. */
      labels?: { r?: string; angle?: string; inner?: string };
    };

/** Lösungsschlüssel einer Aufgabe. Supabase: Tabellen exercise_keys/hints/solutions ohne Leserecht für Clients. */
export interface ExerciseKey {
  answer: ExpectedAnswer;
  /** Genau 3 gestufte Hinweise (allgemein → konkret). Danach: Lösung anzeigen. */
  hints: [string, string, string];
  solution: ModelSolution;
  commonMistakes: CommonMistake[];
}

/** Aufgabe in der Wissensbasis (src/content): öffentliche Felder + Lösungsschlüssel. `answerFormat` wird abgeleitet. */
export type AuthoredExercise = Omit<Exercise, 'answerFormat'> & ExerciseKey;

/** Was der Schüler nach einer Abgabe (oder im Verlauf) zu einer Aufgabe sehen darf. */
export interface ExerciseReview {
  hints: string[];
  solution: ModelSolution;
  commonMistakes: CommonMistake[];
}

/** Bereits aufgedeckte Hilfen der laufenden Bearbeitung (überlebt Neuladen und Gerätewechsel). */
export interface ExerciseSessionState {
  hints: string[];
  solution: ModelSolution | null;
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

/** Kapitel bzw. Thema in der Wissensbasis, mit Lösungsschlüsseln. */
export type AuthoredSubtopic = Omit<Subtopic, 'exercises'> & { exercises: AuthoredExercise[] };
export type AuthoredTopic = Omit<Topic, 'subtopics'> & { subtopics: AuthoredSubtopic[] };
