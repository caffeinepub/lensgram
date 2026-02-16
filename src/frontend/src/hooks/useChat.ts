import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import type { Message } from '../backend';

export function useGetMessages(otherUserPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', otherUserPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !otherUserPrincipal) return [];
      return actor.getMessages(otherUserPrincipal);
    },
    enabled: !!actor && !actorFetching && !!otherUserPrincipal,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recipient, content }: { recipient: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(recipient, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.recipient.toString()] });
    },
  });
}
