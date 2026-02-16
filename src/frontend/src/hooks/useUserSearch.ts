import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile } from '../backend';

export function useSearchUserByUsername(username: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userSearch', username],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!username.trim()) return null;
      return actor.getUserByUsername(username.trim());
    },
    enabled: !!actor && !actorFetching && !!username.trim(),
    retry: false,
  });
}
