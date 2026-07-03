/**
 * Custom hooks for Branch operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { branchApi } from '../services/api';
import type { BranchCreate, BranchUpdate } from '../types';

const QUERY_KEY = ['branches'];

export function useBranches(includeHierarchy = false) {
  return useQuery({
    queryKey: [...QUERY_KEY, { includeHierarchy }],
    queryFn: () => branchApi.getAll(includeHierarchy),
  });
}

export function useBranch(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => branchApi.getById(id!),
    enabled: id !== null,
  });
}

export function useBranchWithChildren(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, 'with-children'],
    queryFn: () => branchApi.getWithChildren(id!),
    enabled: id !== null,
  });
}

export function useBranchChildren(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id, 'children'],
    queryFn: () => branchApi.getChildren(id!),
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
