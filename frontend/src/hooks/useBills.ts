/**
 * Custom hooks for Bill operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billApi } from '../services/api';
import type { BillCreate, BillUpdate } from '../types';

const QUERY_KEY = ['bills'];

export function useBills(branchId?: number, includeChildren = false) {
  return useQuery({
    queryKey: [...QUERY_KEY, { branchId, includeChildren }],
    queryFn: () => billApi.getAll(branchId, includeChildren),
  });
}

export function useBill(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => billApi.getById(id!),
    enabled: id !== null,
  });
}

export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BillCreate) => billApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BillUpdate }) =>
      billApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => billApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
