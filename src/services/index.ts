/**
 * Composition Root: wählt die Implementierung anhand der .env.
 * Kein Supabase konfiguriert ⇒ lokaler Modus (localStorage + Mock-Auth), in Production nur mit VITE_DATA_MODE=local.
 */
import { dataMode } from './config';
import { createLocalAuthService } from './local/localAuthService';
import { createLocalGradingService } from './local/localGradingService';
import { createLocalLearnerRepository } from './local/localLearnerRepository';
import { createAttemptSubmissionService } from './shared/attemptSubmissionService';
import { createDraftStore } from './shared/draftStore';
import { createProgressService } from './shared/progressService';
import { createStaticContentRepository } from './shared/staticContentRepository';
import { createTopicMatcherService } from './shared/topicMatcherService';
import { createSupabaseAuthService } from './supabase/supabaseAuthService';
import { createSupabaseContentRepository } from './supabase/supabaseContentRepository';
import { createSupabaseGradingService } from './supabase/supabaseGradingService';
import { createSupabaseLearnerRepository } from './supabase/supabaseLearnerRepository';
import type { Services } from './types';

function createLocalServices(): Services {
  const content = createStaticContentRepository();
  const learner = createLocalLearnerRepository();
  const grading = createLocalGradingService(learner);
  return {
    mode: 'local',
    auth: createLocalAuthService((userId) => learner.deleteUserData(userId)),
    content,
    learner,
    progress: createProgressService(content, learner),
    grading,
    topicMatcher: createTopicMatcherService(content),
    attempts: createAttemptSubmissionService(grading, createDraftStore()),
  };
}

function createSupabaseServices(): Services {
  const content = createSupabaseContentRepository();
  const learner = createSupabaseLearnerRepository();
  const grading = createSupabaseGradingService(learner);
  return {
    mode: 'supabase',
    auth: createSupabaseAuthService(),
    content,
    learner,
    progress: createProgressService(content, learner),
    grading,
    topicMatcher: createTopicMatcherService(content),
    attempts: createAttemptSubmissionService(grading, createDraftStore()),
  };
}

export const services: Services = dataMode === 'supabase' ? createSupabaseServices() : createLocalServices();
export type * from './types';
