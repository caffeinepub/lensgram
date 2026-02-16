import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { ConnectionRequest, UserProfile } from '../backend';

export function useGetPendingRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ConnectionRequest[]>({
    queryKey: ['pendingRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPendingRequests();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });
}

export function useGetPendingRequestProfiles() {
  const { actor, isFetching: actorFetching } = useActor();
  const { data: requests = [] } = useGetPendingRequests();

  return useQuery<Array<{ request: ConnectionRequest; profile: UserProfile | null }>>({
    queryKey: ['pendingRequestProfiles', requests.map(r => r.requester.toString())],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const profiles = await Promise.all(
        requests.map(async (request) => {
          try {
            const profile = await actor.getUserProfile(request.requester);
            return { request, profile };
          } catch {
            return { request, profile: null };
          }
        })
      );
      return profiles;
    },
    enabled: !!actor && !actorFetching && requests.length > 0,
  });
}

export function useSendConnectionRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendConnectionRequest(targetPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useAcceptConnectionRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptConnectionRequest(requesterPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connectionProfiles'] });
    },
  });
}

export function useRejectConnectionRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requesterPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectConnectionRequest(requesterPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
}

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

export function useConnectionStatus(targetPrincipal: Principal | null) {
  const { data: connections = [] } = useGetConnections();
  const { data: pendingRequests = [] } = useGetPendingRequests();
  const { identity } = useInternetIdentity();

  if (!targetPrincipal || !identity) {
    return { status: 'unknown' as const, isConnected: false };
  }

  const targetStr = targetPrincipal.toString();
  const isConnected = connections.some(p => p.toString() === targetStr);
  
  if (isConnected) {
    return { status: 'connected' as const, isConnected: true };
  }

  const hasIncomingRequest = pendingRequests.some(r => r.requester.toString() === targetStr);
  if (hasIncomingRequest) {
    return { status: 'incoming' as const, isConnected: false };
  }

  return { status: 'not_connected' as const, isConnected: false };
}
