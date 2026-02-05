/**
 * API service functions for TECC
 */

import apiClient from './apiClient';
import type {
  Branch,
  BranchWithChildren,
  BranchCreate,
  BranchUpdate,
  Vendor,
  VendorCreate,
  VendorUpdate,
  Category,
  CategoryCreate,
  CategoryUpdate,
  Bill,
  BillCreate,
  BillUpdate,
} from '../types';

const API_PREFIX = '/api/v1';

// ============ BRANCHES ============

export const branchApi = {
  getAll: async (includeHierarchy = false): Promise<Branch[]> => {
    const response = await apiClient.get(`${API_PREFIX}/branches`, {
      params: { include_hierarchy: includeHierarchy }
    });
    return response.data;
  },

  getById: async (id: number): Promise<Branch> => {
    const response = await apiClient.get(`${API_PREFIX}/branches/${id}`);
    return response.data;
  },

  getWithChildren: async (id: number): Promise<BranchWithChildren> => {
    const response = await apiClient.get(`${API_PREFIX}/branches/${id}/with-children`);
    return response.data;
  },

  getChildren: async (id: number): Promise<Branch[]> => {
    const response = await apiClient.get(`${API_PREFIX}/branches/${id}/children`);
    return response.data;
  },

  create: async (data: BranchCreate): Promise<Branch> => {
    const response = await apiClient.post(`${API_PREFIX}/branches`, data);
    return response.data;
  },

  update: async (id: number, data: BranchUpdate): Promise<Branch> => {
    const response = await apiClient.put(`${API_PREFIX}/branches/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/branches/${id}`);
  },
};

// ============ VENDORS ============

export const vendorApi = {
  getAll: async (): Promise<Vendor[]> => {
    const response = await apiClient.get(`${API_PREFIX}/vendors`);
    return response.data;
  },

  getById: async (id: number): Promise<Vendor> => {
    const response = await apiClient.get(`${API_PREFIX}/vendors/${id}`);
    return response.data;
  },

  create: async (data: VendorCreate): Promise<Vendor> => {
    const response = await apiClient.post(`${API_PREFIX}/vendors`, data);
    return response.data;
  },

  update: async (id: number, data: VendorUpdate): Promise<Vendor> => {
    const response = await apiClient.put(`${API_PREFIX}/vendors/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/vendors/${id}`);
  },
};

// ============ CATEGORIES ============

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get(`${API_PREFIX}/categories`);
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`${API_PREFIX}/categories/${id}`);
    return response.data;
  },

  create: async (data: CategoryCreate): Promise<Category> => {
    const response = await apiClient.post(`${API_PREFIX}/categories`, data);
    return response.data;
  },

  update: async (id: number, data: CategoryUpdate): Promise<Category> => {
    const response = await apiClient.put(`${API_PREFIX}/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/categories/${id}`);
  },
};

// ============ BILLS ============

export const billApi = {
  getAll: async (branchId?: number, includeChildren = false): Promise<Bill[]> => {
    const params: Record<string, any> = {};
    if (branchId) {
      params.branch_id = branchId;
      params.include_children = includeChildren;
    }
    const response = await apiClient.get(`${API_PREFIX}/bills`, { params });
    return response.data;
  },

  getById: async (id: number): Promise<Bill> => {
    const response = await apiClient.get(`${API_PREFIX}/bills/${id}`);
    return response.data;
  },

  getByBranch: async (branchId: number, includeChildren = false): Promise<Bill[]> => {
    const response = await apiClient.get(`${API_PREFIX}/bills/branch/${branchId}`, {
      params: { include_children: includeChildren }
    });
    return response.data;
  },

  create: async (data: BillCreate): Promise<Bill> => {
    const response = await apiClient.post(`${API_PREFIX}/bills`, data);
    return response.data;
  },

  update: async (id: number, data: BillUpdate): Promise<Bill> => {
    const response = await apiClient.put(`${API_PREFIX}/bills/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/bills/${id}`);
  },
};
