/**
 * Custom hooks for Branch operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchApi } from '../services/api';
import type { BranchCreate, BranchUpdate } from '../types';

const QUERY_KEY = ['branches'];

export function useBranches() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: branchApi.getAll,
  });
}

export function useBranch(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => branchApi.getById(id!),
    enabled: id !== null,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BranchCreate) => branchApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BranchUpdate }) =>
      branchApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => branchApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
