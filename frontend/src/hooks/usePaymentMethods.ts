/**
 * Custom hooks for PaymentMethod operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentMethodApi } from '../services/api';
import type { PaymentMethodCreate, PaymentMethodUpdate } from '../types';

const QUERY_KEY = ['payment-methods'];

export function usePaymentMethods() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: paymentMethodApi.getAll,
  });
}

export function useActivePaymentMethods() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'active'],
    queryFn: paymentMethodApi.getActive,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PaymentMethodCreate) => paymentMethodApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentMethodUpdate }) =>
      paymentMethodApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => paymentMethodApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
