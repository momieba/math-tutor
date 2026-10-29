/**
 * Individuelle Nutzerdaten (personenbezogen). Strikt getrennt von den Lerninhalten.
 */

export type Role = 'student' | 'parent' | 'teacher' | 'admin';

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  grade?: number;
  createdAt: string; // ISO
}

export interface Session {
  user: Profile;
  provider: 'local' | 'supabase';
}

/** Vom Schüler aktiviertes Thema (Kachel im Dashboard). */
export interface StudentTopic {
  userId: string;
  topicId: string;
  addedAt: string;
}

export type AttemptMode = 'practice' | 'test';

export interface Attempt {
  id: string;
  userId: string;
  exerciseId: string;
  subtopicId: string;
  topicId: string;
  mode: AttemptMode;
  answerRaw: string;
  /** Teilpunkte 0..1 (aus Correction übernommen). */
  points: number;
  isCorrect: boolean;
  hintsUsed: 0 | 1 | 2 | 3;
  solutionViewed: boolean;
  startedAt: string;
  submittedAt: string;
}

export type SubmissionKind = 'canvas' | 'photo' | 'text';

export interface Submission {
  id: string;
  attemptId: string;
  kind: SubmissionKind;
  /** Lokal: data-URL. Supabase: Pfad im privaten Storage-Bucket `submissions`. */
  imageRef?: string;
  /** Optionale Rohdaten der Handschrift (Strokes) für spätere Auswertung. */
  strokes?: unknown;
  createdAt: string;
}

export type MarkColor = 'green' | 'yellow' | 'red';

export interface CorrectionMark {
  color: MarkColor;
  message: string;
  stepIndex?: number;
}

export type Verdict = 'correct' | 'partial' | 'incorrect' | 'unclear';

export interface Correction {
  id: string;
  attemptId: string;
  /** auto = deterministische Prüfung, self = Selbsteinschätzung, ai = KI (Phase 2), teacher = Lehrkraft. */
  source: 'auto' | 'self' | 'ai' | 'teacher';
  verdict: Verdict;
  points: number;
  marks: CorrectionMark[];
  feedback: string;
  createdAt: string;
}

export interface AttemptRecord extends Attempt {
  correction?: Correction;
  submission?: Submission;
}

export interface NewAttemptInput {
  userId: string;
  exerciseId: string;
  subtopicId: string;
  topicId: string;
  mode: AttemptMode;
  answerRaw: string;
  hintsUsed: 0 | 1 | 2 | 3;
  solutionViewed: boolean;
  startedAt: string;
  correction: Omit<Correction, 'id' | 'attemptId' | 'createdAt'>;
  submission?: { kind: SubmissionKind; dataUrl?: string; strokes?: unknown };
}

export type ChapterStatus = 'not_started' | 'in_progress' | 'needs_practice' | 'mastered';

export const CHAPTER_STATUS_LABEL: Record<ChapterStatus, string> = {
  not_started: 'Nicht begonnen',
  in_progress: 'In Bearbeitung',
  needs_practice: 'Übung erforderlich',
  mastered: 'Sicher beherrscht',
};

export interface SubtopicProgress {
  subtopicId: string;
  score: number; // Verständnis-Score 0..100
  status: ChapterStatus;
  /** Bearbeitungsfortschritt 0..1 (bearbeitete / alle Aufgaben). */
  completion: number;
  totalExercises: number;
  attemptedExercises: number;
  solvedExercises: number;
  /** Transparenz für den Schüler: aktive Deckel / Gründe. */
  caps: ScoreCap[];
  components: { mastery: number; typeCoverage: number };
}

export interface TopicProgress {
  topicId: string;
  score: number;
  completion: number;
  status: ChapterStatus;
  subtopics: SubtopicProgress[];
  lastActivityAt?: string;
}

export type ScoreCap = 'type-coverage' | 'no-hard-exercise' | 'no-confirmation';
