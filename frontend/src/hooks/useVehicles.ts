import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleApi } from '../services/api';
import type { VehicleCreate, VehicleUpdate, BillCreate } from '../types';

const QUERY_KEY = ['vehicles'];

export function useVehicles() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => vehicleApi.getAll(),
  });
}

export function useVehicle(id: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => vehicleApi.getById(id!),
    enabled: id !== null,
  });
}

export function useVehicleBills(vehicleId: number | null) {
  return useQuery({
    queryKey: [...QUERY_KEY, vehicleId, 'bills'],
    queryFn: () => vehicleApi.getBills(vehicleId!),
    enabled: vehicleId !== null,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VehicleCreate) => vehicleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleUpdate }) =>
      vehicleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => vehicleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useCreateVehicleBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: number; data: BillCreate }) =>
      vehicleApi.createBill(vehicleId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, variables.vehicleId, 'bills'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });
}
