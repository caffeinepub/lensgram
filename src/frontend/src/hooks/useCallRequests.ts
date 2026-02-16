import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { CallState } from '../backend';

export function useGetCallState() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CallState | null>({
    queryKey: ['callState'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallState();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 2000,
  });
}

export function useInitiateCall() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calleePrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.initiateCall(calleePrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callState'] });
    },
  });
}

export function useAcceptCall() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callInitiatorPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptCall(callInitiatorPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callState'] });
    },
  });
}

export function useDeclineCall() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callInitiatorPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.declineCall(callInitiatorPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callState'] });
    },
  });
}

export function useEndCall() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.endCall(partnerPrincipal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callState'] });
    },
  });
}
