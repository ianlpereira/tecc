/**
 * Hooks for fetching vehicle brands and models from a FIPE provider.
 * Switched to Parallelum FIPE API because the BrasilAPI FIPE endpoints
 * returned 404 in production. Parallelum is public, CORS-enabled and
 * returns the official FIPE tables.
 * Base URL: https://parallelum.com.br/fipe/api/v1
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const PARALLELUM_API = 'https://parallelum.com.br/fipe/api/v1';

export type FipeVehicleType = 'carros' | 'motos' | 'caminhoes';

export interface FipeBrand {
  nome: string;
  valor: string; // brand code used to fetch models
}

export interface FipeModel {
  modelo: string;
}

async function fetchFipeBrands(type: FipeVehicleType): Promise<FipeBrand[]> {
  // Parallelum returns [{ codigo, nome }]
  const { data } = await axios.get<{ codigo: number; nome: string }[]>(
    `${PARALLELUM_API}/${type}/marcas`,
  );
  // Map to existing FipeBrand shape { nome, valor }
  return data.map((b) => ({ nome: b.nome, valor: String(b.codigo) }));
}

async function fetchFipeModels(
  type: FipeVehicleType,
  brandCode: string,
): Promise<FipeModel[]> {
  // Parallelum returns { modelos: [{ codigo, nome }], anos: [...] }
  const { data } = await axios.get<{ modelos: { codigo: number; nome: string }[] }>(
    `${PARALLELUM_API}/${type}/marcas/${brandCode}/modelos`,
  );
  return data.modelos.map((m) => ({ modelo: m.nome }));
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
