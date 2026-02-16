import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@dfinity/principal';

// This file is intentionally minimal as feature-specific hooks are in separate files
export function useActorReady() {
  const { actor, isFetching } = useActor();
  return { actor, isReady: !!actor && !isFetching };
}
