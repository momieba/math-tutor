/**
 * Service-Schnittstellen. UI/Hooks kennen NUR diese Interfaces – nie Supabase oder localStorage direkt.
 */
import type { EvaluationResult } from '../domain/evaluate';
import type { MatchResult } from '../domain/topicMatcher';
import type {
  AttemptRecord,
  AttemptSubmission,
  Curriculum,
  Exercise,
  ExerciseReview,
  ExerciseSessionState,
  ModelSolution,
  Session,
  StudentTopic,
  Subtopic,
  Submission,
  Topic,
  TopicProgress,
  TopicSummary,
  SubtopicProgress,
} from '../types';

export type DataMode = 'local' | 'supabase';

export interface AuthService {
  readonly mode: DataMode;
  getSession(): Promise<Session | null>;
  /** Liefert eine Abmelde-Funktion. */
  onAuthChange(cb: (session: Session | null) => void): () => void;
  /** Gibt `null` zurück, wenn eine E-Mail-Bestätigung nötig ist (Supabase). */
  signUpWithEmail(email: string, password: string, displayName: string, consentVersion: string): Promise<Session | null>;
  signInWithEmail(email: string, password: string): Promise<Session>;
  /** Supabase: Redirect zu Google. Lokal: Demo-Login „Google (Demo)“. */
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  /** Schickt einen Link zum Zurücksetzen des Passworts (Supabase). Lokal nicht verfügbar. */
  requestPasswordReset(email: string): Promise<void>;
  /** Neues Passwort für die aktuelle Sitzung (auch die Wiederherstellungs-Sitzung aus dem E-Mail-Link). */
  updatePassword(password: string): Promise<void>;
  /** Speichert die Einwilligung (Version aus src/config/legal.ts) und meldet die aktualisierte Sitzung. */
  acceptTerms(version: string): Promise<Session>;
  /** Löscht Konto, Lerndaten und Bilder endgültig und meldet ab. */
  deleteAccount(): Promise<void>;
}

/** Lesender Zugriff auf die Wissensbasis (Lehrplan, Themen, Kapitel, Aufgaben). */
export interface ContentRepository {
  listCurricula(): Promise<Curriculum[]>;
  /** Alle Themen mit Kapiteln und Aufgaben (ohne Lösungen), z. B. für das Topic-Matching. */
  listCatalog(): Promise<Topic[]>;
  listTopics(): Promise<TopicSummary[]>;
  getTopic(topicId: string): Promise<Topic | null>;
  getSubtopic(subtopicId: string): Promise<Subtopic | null>;
  getExercise(exerciseId: string): Promise<Exercise | null>;
}

export interface AttemptFilter {
  topicId?: string;
  subtopicId?: string;
  exerciseId?: string;
  limit?: number; // neueste zuerst
}

/** Personenbezogene Lerndaten eines Schülers. Jede Methode ist auf `userId` beschränkt (Supabase: zusätzlich RLS). */
export interface LearnerRepository {
  listActiveTopics(userId: string): Promise<StudentTopic[]>;
  addActiveTopic(userId: string, topicId: string): Promise<StudentTopic>;
  removeActiveTopic(userId: string, topicId: string): Promise<void>;
  listAttempts(userId: string, filter?: AttemptFilter): Promise<AttemptRecord[]>;
  getAttempt(userId: string, attemptId: string): Promise<AttemptRecord | null>;
  /** Anzeigbare URL für Handschrift/Foto (lokal: data-URL, Supabase: signierte URL). */
  getSubmissionImageUrl(submission: Submission): Promise<string | null>;
  /** Alle gespeicherten Lerndaten des Nutzers als JSON-taugliches Objekt (DSGVO Art. 15/20). */
  exportData(userId: string): Promise<Record<string, unknown>>;
  /** Lernpfad: Einstieg/Erklärung des Kapitels gesehen? null, wenn nichts gespeichert ist (lokal: immer null, dort zählt der Browser). */
  getPathSeen(userId: string, subtopicId: string): Promise<PathSeen | null>;
  /** Speichert den Stand (nur zunehmend: einmal gesehen bleibt gesehen). */
  markPathSeen(userId: string, subtopicId: string, seen: PathSeen): Promise<void>;
}

/** Im Lernpfad gesehene bzw. übersprungene Schritte eines Kapitels. */
export interface PathSeen {
  intro: boolean;
  explain: boolean;
}

/** Ergebnis einer Bewertung: Rückfrage (nichts gespeichert) oder gespeicherter Versuch mit Lösung zum Nachlesen. */
export type GradeOutcome =
  | { status: 'unclear'; evaluation: EvaluationResult }
  | { status: 'saved'; record: AttemptRecord; evaluation: EvaluationResult; review: ExerciseReview };

/**
 * Bewertung und Hilfen. Der Client kennt die Lösung nicht; Hinweise und Musterlösung werden einzeln angefordert
 * und dabei protokolliert, damit der Score die genutzten Hilfen fälschungssicher berücksichtigt.
 * Lokal: gleiche Regeln im Browser. Supabase: RPCs + Edge Function `grade-attempt`.
 */
export interface GradingService {
  /** Bereits aufgedeckte Hilfen der laufenden Bearbeitung. */
  getSession(userId: string, exerciseId: string): Promise<ExerciseSessionState>;
  /** Aufgabe ohne Abgabe verlassen (überspringen): genutzte Hilfen verwerfen, beim nächsten Mal beginnt sie von vorn. */
  discardSession(userId: string, exerciseId: string): Promise<void>;
  /** Deckt Hinweis `level` auf (nur der Reihe nach) und liefert die Hinweise 1…level. */
  revealHint(userId: string, exerciseId: string, level: 1 | 2 | 3): Promise<string[]>;
  /** Musterlösung VOR der Abgabe: zählt als „Lösung angesehen“. */
  revealSolution(userId: string, exerciseId: string): Promise<ModelSolution>;
  /** Hinweise, Lösung und typische Fehler zum Nachlesen – nur, wenn es schon einen Versuch gibt. */
  getReview(userId: string, exerciseId: string): Promise<ExerciseReview | null>;
  grade(input: AttemptSubmission): Promise<GradeOutcome>;
}

/** Berechnet Fortschritt/Score aus Content + Attempts (backend-unabhängig). */
export interface ProgressService {
  getSubtopicProgress(userId: string, subtopicId: string): Promise<SubtopicProgress>;
  getTopicProgress(userId: string, topicId: string): Promise<TopicProgress>;
}

/** Nicht gespeicherte Abgabe (z. B. Netzwerkfehler, Speicher voll). Immer lokal im Browser, unabhängig vom Modus. */
export interface PendingAttempt {
  input: AttemptSubmission;
  savedAt: string;
  lastError?: string;
  /** true, wenn der Entwurf wegen Speicherplatz ohne Bild/Striche gesichert werden musste. */
  imageDropped?: boolean;
}

export interface DraftRepository {
  get(userId: string, exerciseId: string): Promise<PendingAttempt | null>;
  /** Liefert, ob (und wie vollständig) gesichert werden konnte. Wirft nie. */
  save(draft: PendingAttempt): Promise<{ saved: boolean; imageDropped: boolean }>;
  remove(userId: string, exerciseId: string): Promise<void>;
}

export type SubmitResult = { ok: true; outcome: GradeOutcome } | { ok: false; error: string; draftSaved: boolean; imageDropped: boolean };

/** Abgabe mit Ausfallsicherung: Schlägt das Speichern fehl, bleibt die Eingabe als Entwurf erhalten. */
export interface AttemptSubmissionService {
  submit(input: AttemptSubmission): Promise<SubmitResult>;
  getPending(userId: string, exerciseId: string): Promise<PendingAttempt | null>;
  discardPending(userId: string, exerciseId: string): Promise<void>;
}

export interface TopicMatcherService {
  match(query: string): Promise<MatchResult>;
}

export interface Services {
  mode: DataMode;
  auth: AuthService;
  content: ContentRepository;
  learner: LearnerRepository;
  progress: ProgressService;
  grading: GradingService;
  topicMatcher: TopicMatcherService;
  attempts: AttemptSubmissionService;
}
