import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billApi } from '../services/api';
import type {
  BillCreate,
  BillUpdate,
  MarkPaidPayload,
  BillRecurrenceUpdate,
  BatchDeleteRequest,
  BatchMarkPaidRequest,
} from '../types';

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

export function useMarkBillAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: MarkPaidPayload }) =>
      billApi.markAsPaid(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Epic 13: Update recurring bill with scope ---
export function useUpdateBillRecurrence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BillRecurrenceUpdate }) =>
      billApi.updateRecurrence(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Epic 14: Batch operations ---
export function useBatchDeleteBills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchDeleteRequest) => billApi.batchDelete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useBatchMarkPaidBills() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchMarkPaidRequest) => billApi.batchMarkPaid(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// --- Epic 15: Due today summary ---
export function useDueTodaySummary(branchId?: number) {
  return useQuery({
    queryKey: ['bills-due-today-summary', branchId],
    queryFn: () => billApi.getDueTodaySummary(branchId),
  });
}

// --- Epic 16: Reports ---
export function useReport(filters: Record<string, any>) {
  return useQuery({
    queryKey: ['bills-report', filters],
    queryFn: () => billApi.getReport(filters),
    enabled: false, // manual trigger via refetch
  });
}
