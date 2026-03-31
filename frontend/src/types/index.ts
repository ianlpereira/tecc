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
  vehicle_id?: number | null;
  payment_method_id?: number | null;    // Epic 17
  payment_method_name?: string | null;  // Epic 17
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
  recurrence_dates?: string[] | null;
  vehicle_id?: number | null;
  payment_method_id?: number | null;  // Epic 17
}

export interface BillUpdate {
  description?: string;
  amount?: number;
  due_date?: string;
  status?: BillStatus;
  invoice_number?: string | null;
  notes?: string | null;
  payment_bank?: string | null;
  paid_at?: string | null;
  vendor_id?: number;
  category_id?: number;
  branch_id?: number;
  vehicle_id?: number | null;
  payment_method_id?: number | null;  // Epic 17
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

// Vehicle types
export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  branch_id: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  branch_id: number;
  notes?: string | null;
}

export interface VehicleUpdate {
  plate?: string;
  brand?: string;
  model?: string;
  year?: number | null;
  branch_id?: number;
  notes?: string | null;
}

// Payment Method types
export interface PaymentMethod {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodCreate {
  name: string;
  is_active?: boolean;
}

export interface PaymentMethodUpdate {
  name?: string;
  is_active?: boolean;
}

// --- Epic 13: Recurrence update scope ---
export interface BillRecurrenceUpdate {
  scope: 'this' | 'this_and_next' | 'all';
  description?: string;
  amount?: number;
  due_date?: string;
  invoice_number?: string | null;
  notes?: string | null;
  vendor_id?: number;
  category_id?: number;
  branch_id?: number;
  vehicle_id?: number | null;
  payment_method_id?: number | null;  // Epic 17
}

// --- Epic 14: Batch operations ---
export interface BatchDeleteRequest {
  ids: number[];
}

export interface BatchMarkPaidRequest {
  ids: number[];
  payment_bank?: string | null;
  paid_at?: string | null;
}

export interface BatchDeleteResponse {
  deleted: number;
}

export interface BatchMarkPaidResponse {
  updated: number;
  skipped: number;
}

// --- Epic 15: Due today summary ---
export interface DueTodaySummary {
  count: number;
  total_amount: number;
  overdue_count: number;
  overdue_amount: number;
  due_today_count: number;
  due_today_amount: number;
}

// --- Epic 16: Reports ---
export interface BillReportRow {
  id: number;
  description: string;
  vendor_name: string | null;
  category_name: string | null;
  branch_name: string | null;
  vehicle_plate: string | null;
  amount: number;
  due_date: string;
  status: BillStatus;
  payment_bank: string | null;
  paid_at: string | null;
  payment_method_name: string | null;  // Epic 17
}

export interface BillReportSummary {
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  count: number;
}

export interface BillReportResponse {
  rows: BillReportRow[];
  summary: BillReportSummary;
}

// ============ AUTH / USER types (Epic 18) ============

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'user';
  is_active: boolean;
  must_change_password: boolean;
}

export interface UserCreate {
  username: string;
  password: string;
  email?: string | null;
  full_name?: string | null;
  role: 'admin' | 'user';
}

export interface UserUpdate {
  email?: string | null;
  full_name?: string | null;
  role?: 'admin' | 'user';
  is_active?: boolean;
  password?: string | null;
}
