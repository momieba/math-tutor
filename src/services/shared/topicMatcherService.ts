import { topics } from '../../content';
import { matchTopic } from '../../domain/topicMatcher';
import type { TopicMatcherService } from '../types';

/** MVP: deterministisch. Später: Fallback auf Edge Function `match-topic` bei 'ambiguous' | 'none'. */
export function createTopicMatcherService(): TopicMatcherService {
  return {
    async match(query) {
      return matchTopic(query, topics);
    },
  };
}
