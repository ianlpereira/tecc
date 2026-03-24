/**
 * Date utilities for TECC application.
 *
 * The backend returns dates as pure "YYYY-MM-DD" strings (no timezone).
 * All helpers here operate on that plain string format to avoid UTC offset
 * shifting when the browser runs in BRT (UTC-3) or any other timezone.
 *
 * Rule: NEVER pass a raw "YYYY-MM-DD" string to `new Date()` or `dayjs()`
 *       without a format argument — both constructors interpret it as UTC
 *       midnight and shift the displayed day by the local UTC offset.
 */

import dayjs from 'dayjs';
import { BillStatus } from '../types';
import type { Bill } from '../types';

/**
 * Parse a "YYYY-MM-DD" date string into a local (timezone-safe) Date object.
 * Uses manual splitting so no UTC interpretation occurs.
 */
export const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Format a "YYYY-MM-DD" string to "DD/MM/YYYY" for display in pt-BR.
 * Safe against UTC offset — does NOT use new Date() or dayjs(dateStr).
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
};

/**
 * Convert a "YYYY-MM-DD" string to a dayjs object interpreted in local time.
 * Use this instead of dayjs(dateStr) to prevent UTC shifting.
 */
export const parseDayjs = (dateStr: string | null | undefined): dayjs.Dayjs | null => {
  if (!dateStr) return null;
  return dayjs(dateStr, 'YYYY-MM-DD');
};

/**
 * Returns true if the given "YYYY-MM-DD" date corresponds to today (local time).
 */
export const isToday = (dateStr: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseLocalDate(dateStr).getTime() === today.getTime();
};

/**
 * Returns true if the bill is overdue:
 * - status is PENDING
 * - due_date is strictly before today (local time)
 */
export const isBillOverdue = (bill: Bill): boolean => {
  if (bill.status !== BillStatus.PENDING) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseLocalDate(bill.due_date) < today;
};
