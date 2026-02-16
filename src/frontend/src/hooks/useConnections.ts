import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { UserProfile } from '../backend';

export function useGetConnections() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['connections'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getConnections();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetConnectionProfiles() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: connections = [] } = useGetConnections();

  return useQuery<UserProfile[]>({
    queryKey: ['connectionProfiles', connections.map(p => p.toString())],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const profiles = await Promise.all(
        connections.map(async (principal) => {
          try {
            return await actor.getUserProfile(principal);
          } catch {
            return null;
          }
        })
      );
      return profiles.filter((p): p is UserProfile => p !== null);
    },
    enabled: !!actor && !actorFetching && connections.length > 0,
  });
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principal,
  });
}
