/**
 * Service-Schnittstellen. UI/Hooks kennen NUR diese Interfaces – nie Supabase oder localStorage direkt.
 */
import type { MatchResult } from '../domain/topicMatcher';
import type {
  AttemptRecord,
  Curriculum,
  Exercise,
  NewAttemptInput,
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
  signUpWithEmail(email: string, password: string, displayName: string): Promise<Session | null>;
  signInWithEmail(email: string, password: string): Promise<Session>;
  /** Supabase: Redirect zu Google. Lokal: Demo-Login „Google (Demo)“. */
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
}

/** Lesender Zugriff auf die Wissensbasis (Lehrplan, Themen, Kapitel, Aufgaben). */
export interface ContentRepository {
  listCurricula(): Promise<Curriculum[]>;
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
  /** Speichert Attempt + Correction (+ optional Submission/Bild) atomar aus Sicht der UI. */
  saveAttempt(input: NewAttemptInput): Promise<AttemptRecord>;
  listAttempts(userId: string, filter?: AttemptFilter): Promise<AttemptRecord[]>;
  getAttempt(userId: string, attemptId: string): Promise<AttemptRecord | null>;
  /** Anzeigbare URL für Handschrift/Foto (lokal: data-URL, Supabase: signierte URL). */
  getSubmissionImageUrl(submission: Submission): Promise<string | null>;
}

/** Berechnet Fortschritt/Score aus Content + Attempts (backend-unabhängig). */
export interface ProgressService {
  getSubtopicProgress(userId: string, subtopicId: string): Promise<SubtopicProgress>;
  getTopicProgress(userId: string, topicId: string): Promise<TopicProgress>;
}

/** Nicht gespeicherte Abgabe (z. B. Netzwerkfehler, Speicher voll). Immer lokal im Browser, unabhängig vom Modus. */
export interface PendingAttempt {
  input: NewAttemptInput;
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

export type SubmitResult = { ok: true; record: AttemptRecord } | { ok: false; error: string; draftSaved: boolean; imageDropped: boolean };

/** Abgabe mit Ausfallsicherung: Schlägt das Speichern fehl, bleibt die Eingabe als Entwurf erhalten. */
export interface AttemptSubmissionService {
  submit(input: NewAttemptInput): Promise<SubmitResult>;
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
  topicMatcher: TopicMatcherService;
  attempts: AttemptSubmissionService;
}
