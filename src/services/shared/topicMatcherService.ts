import { matchTopic } from '../../domain/topicMatcher';
import type { ContentRepository, TopicMatcherService } from '../types';

/** MVP: deterministisch über den Themenkatalog. Später: Fallback auf Edge Function `match-topic` bei 'ambiguous' | 'none'. */
export function createTopicMatcherService(content: ContentRepository): TopicMatcherService {
  return {
    async match(query) {
      return matchTopic(query, await content.listCatalog());
    },
  };
}
