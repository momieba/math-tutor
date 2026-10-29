/**
 * Composition Root: wählt die Implementierung anhand der .env.
 * Kein Supabase konfiguriert ⇒ lokaler Modus (localStorage + Mock-Auth).
 */
import { dataMode } from './config';
import { createLocalAuthService } from './local/localAuthService';
import { createLocalLearnerRepository } from './local/localLearnerRepository';
import { createAttemptSubmissionService } from './shared/attemptSubmissionService';
import { createDraftStore } from './shared/draftStore';
import { createProgressService } from './shared/progressService';
import { createStaticContentRepository } from './shared/staticContentRepository';
import { createTopicMatcherService } from './shared/topicMatcherService';
import { createSupabaseAuthService } from './supabase/supabaseAuthService';
import { createSupabaseLearnerRepository } from './supabase/supabaseLearnerRepository';
import type { Services } from './types';

function createServices(): Services {
  const content = createStaticContentRepository();
  const auth = dataMode === 'supabase' ? createSupabaseAuthService() : createLocalAuthService();
  const learner = dataMode === 'supabase' ? createSupabaseLearnerRepository() : createLocalLearnerRepository();
  return {
    mode: dataMode,
    auth,
    content,
    learner,
    progress: createProgressService(content, learner),
    topicMatcher: createTopicMatcherService(),
    attempts: createAttemptSubmissionService(learner, createDraftStore()),
  };
}

export const services: Services = createServices();
export type * from './types';
