/**
 * Hooks for fetching vehicle brands and models from Brasil API (FIPE table).
 * Base URL: https://brasilapi.com.br
 * No authentication required. CORS enabled.
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BRASIL_API = 'https://brasilapi.com.br';

export type FipeVehicleType = 'carros' | 'motos' | 'caminhoes';

export interface FipeBrand {
  nome: string;
  valor: string; // brand code used to fetch models
}

export interface FipeModel {
  modelo: string;
}

async function fetchFipeBrands(type: FipeVehicleType): Promise<FipeBrand[]> {
  const { data } = await axios.get<FipeBrand[]>(
    `${BRASIL_API}/fipe/marcas/v1/${type}`,
  );
  return data;
}

async function fetchFipeModels(
  type: FipeVehicleType,
  brandCode: string,
): Promise<FipeModel[]> {
  const { data } = await axios.get<FipeModel[]>(
    `${BRASIL_API}/fipe/veiculos/v1/${type}/${brandCode}`,
  );
  return data;
}

/** Returns sorted list of FIPE brands for the given vehicle type. */
export function useVehicleBrands(type: FipeVehicleType) {
  return useQuery({
    queryKey: ['fipe', 'brands', type],
    queryFn: () => fetchFipeBrands(type),
    staleTime: 1000 * 60 * 60 * 24, // 24h — brand list rarely changes
    select: (data) =>
      [...data].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
  });
}

/**
 * Returns sorted list of FIPE models for the given brand code.
 * Only fetches when brandCode is provided.
 */
export function useVehicleModels(
  type: FipeVehicleType,
  brandCode: string | null,
) {
  return useQuery({
    queryKey: ['fipe', 'models', type, brandCode],
    queryFn: () => fetchFipeModels(type, brandCode!),
    enabled: !!brandCode,
    staleTime: 1000 * 60 * 60 * 24, // 24h
    select: (data) =>
      [...data].sort((a, b) => a.modelo.localeCompare(b.modelo, 'pt-BR')),
  });
}
