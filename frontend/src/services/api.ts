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
  MarkPaidPayload,
  BillAttachment,
  Vehicle,
  VehicleCreate,
  VehicleUpdate,
  PaymentMethod,
  PaymentMethodCreate,
  PaymentMethodUpdate,
  BillRecurrenceUpdate,
  BatchDeleteRequest,
  BatchMarkPaidRequest,
  BatchDeleteResponse,
  BatchMarkPaidResponse,
  DueTodaySummary,
  BillReportResponse,
  AuthUser,
  UserCreate,
  UserUpdate,
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

  getByGroup: async (groupId: string): Promise<Bill[]> => {
    const response = await apiClient.get(`${API_PREFIX}/bills/group/${groupId}`);
    return response.data;
  },

  markAsPaid: async (id: number, payload?: MarkPaidPayload): Promise<Bill> => {
    const response = await apiClient.post(`${API_PREFIX}/bills/${id}/mark-paid`, payload ?? {});
    return response.data;
  },

  updateRecurrence: async (id: number, data: BillRecurrenceUpdate): Promise<{ updated: number }> => {
    const response = await apiClient.put(`${API_PREFIX}/bills/${id}/recurrence`, data);
    return response.data;
  },

  batchDelete: async (data: BatchDeleteRequest): Promise<BatchDeleteResponse> => {
    const response = await apiClient.post(`${API_PREFIX}/bills/batch-delete`, data);
    return response.data;
  },

  batchMarkPaid: async (data: BatchMarkPaidRequest): Promise<BatchMarkPaidResponse> => {
    const response = await apiClient.post(`${API_PREFIX}/bills/batch-mark-paid`, data);
    return response.data;
  },

  getDueTodaySummary: async (branchId?: number): Promise<DueTodaySummary> => {
    const params: Record<string, any> = {};
    if (branchId) params.branch_id = branchId;
    const response = await apiClient.get(`${API_PREFIX}/bills/summary/due-today`, { params });
    return response.data;
  },

  getReport: async (filters: Record<string, any>): Promise<BillReportResponse> => {
    const response = await apiClient.get(`${API_PREFIX}/bills/report`, { params: filters });
    return response.data;
  },
};

// ============ BILL ATTACHMENTS ============

export const billAttachmentApi = {
  list: async (billId: number): Promise<BillAttachment[]> => {
    const response = await apiClient.get(`${API_PREFIX}/bills/${billId}/attachments/`);
    return response.data;
  },

  upload: async (billId: number, file: File): Promise<BillAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`${API_PREFIX}/bills/${billId}/attachments/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  download: async (billId: number, attachmentId: number): Promise<Blob> => {
    const response = await apiClient.get(
      `${API_PREFIX}/bills/${billId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  delete: async (billId: number, attachmentId: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/bills/${billId}/attachments/${attachmentId}`);
  },
};

// ============ VEHICLES ============

export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await apiClient.get(`${API_PREFIX}/vehicles`);
    return response.data;
  },

  getById: async (id: number): Promise<Vehicle> => {
    const response = await apiClient.get(`${API_PREFIX}/vehicles/${id}`);
    return response.data;
  },

  create: async (data: VehicleCreate): Promise<Vehicle> => {
    const response = await apiClient.post(`${API_PREFIX}/vehicles`, data);
    return response.data;
  },

  update: async (id: number, data: VehicleUpdate): Promise<Vehicle> => {
    const response = await apiClient.put(`${API_PREFIX}/vehicles/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/vehicles/${id}`);
  },

  getBills: async (id: number): Promise<Bill[]> => {
    const response = await apiClient.get(`${API_PREFIX}/vehicles/${id}/bills`);
    return response.data;
  },

  createBill: async (vehicleId: number, data: BillCreate): Promise<Bill> => {
    const response = await apiClient.post(`${API_PREFIX}/vehicles/${vehicleId}/bills`, data);
    return response.data;
  },
};

// ============ PAYMENT METHODS ============

export const paymentMethodApi = {
  getAll: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get(`${API_PREFIX}/payment-methods`);
    return response.data;
  },

  getActive: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get(`${API_PREFIX}/payment-methods/active`);
    return response.data;
  },

  getById: async (id: number): Promise<PaymentMethod> => {
    const response = await apiClient.get(`${API_PREFIX}/payment-methods/${id}`);
    return response.data;
  },

  create: async (data: PaymentMethodCreate): Promise<PaymentMethod> => {
    const response = await apiClient.post(`${API_PREFIX}/payment-methods`, data);
    return response.data;
  },

  update: async (id: number, data: PaymentMethodUpdate): Promise<PaymentMethod> => {
    const response = await apiClient.put(`${API_PREFIX}/payment-methods/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${API_PREFIX}/payment-methods/${id}`);
  },
};

// ============ USERS (Epic 18 — admin only) ============

export const usersApi = {
  getAll: async (): Promise<AuthUser[]> => {
    const response = await apiClient.get(`${API_PREFIX}/users/`);
    return response.data;
  },

  create: async (data: UserCreate): Promise<AuthUser> => {
    const response = await apiClient.post(`${API_PREFIX}/users/`, data);
    return response.data;
  },

  update: async (id: number, data: UserUpdate): Promise<AuthUser> => {
    const response = await apiClient.put(`${API_PREFIX}/users/${id}`, data);
    return response.data;
  },

  deactivate: async (id: number): Promise<AuthUser> => {
    const response = await apiClient.patch(`${API_PREFIX}/users/${id}/deactivate`);
    return response.data;
  },

  activate: async (id: number): Promise<AuthUser> => {
    const response = await apiClient.patch(`${API_PREFIX}/users/${id}/activate`);
    return response.data;
  },
};
