/**
 * Type definitions for TECC application
 */

// Branch types
export interface Branch {
  id: number;
  name: string;
  is_headquarters: boolean;
  parent_branch_id?: number | null;
  parent_name?: string | null;
  children_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BranchWithChildren extends Branch {
  children: Branch[];
}

export interface BranchCreate {
  name: string;
  is_headquarters?: boolean;
  parent_branch_id?: number | null;
}

export interface BranchUpdate {
  name?: string;
  is_headquarters?: boolean;
  parent_branch_id?: number | null;
}

// Vendor types
export interface Vendor {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorCreate {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface VendorUpdate {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  description?: string | null;
}

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
}

// Bill types
export enum BillStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export interface Bill {
  id: number;
  branch_id: number;
  vendor_id: number;
  category_id: number;
  description: string;
  amount: number;
  due_date: string;
  status: BillStatus;
  invoice_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_recurring: boolean;
  recurrence_group_id?: string | null;
  recurrence_interval_days?: number | null;
  recurrence_total?: number | null;
  recurrence_index?: number | null;
  recurrence_day_of_month?: number | null;
  payment_bank?: string | null;
  paid_at?: string | null;
  attachments_count?: number;
}

export interface BillCreate {
  branch_id: number;
  vendor_id: number;
  category_id: number;
  description: string;
  amount: number;
  due_date: string;
  invoice_number?: string | null;
  notes?: string | null;
  is_recurring?: boolean;
  recurrence_interval_days?: number | null;
  recurrence_occurrences?: number | null;
  recurrence_day_of_month?: number | null;
}

export interface BillUpdate {
  description?: string;
  amount?: number;
  due_date?: string;
  status?: BillStatus;
  notes?: string | null;
  payment_bank?: string | null;
  paid_at?: string | null;
}

export interface MarkPaidPayload {
  payment_bank?: string | null;
  paid_at?: string | null;
}

// Bill Attachment types
export interface BillAttachment {
  id: number;
  bill_id: number;
  filename: string;
  mime_type: string | null;
  file_size: number | null;
  created_at: string;
}

// API Response types
export interface ApiError {
  detail: string;
}
