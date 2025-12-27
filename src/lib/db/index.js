/**
 * @deprecated This file is deprecated. The application now uses the backend API
 * via src/api/backendClient.js instead of IndexedDB/Dexie.
 * 
 * This file remains for reference only. All data operations should use the
 * Zustand stores which internally call the backend API.
 * 
 * Migration completed: All stores now use backend API endpoints.
 */

// Export empty stubs to prevent import errors in any remaining test files
export const db = {
  invoices: { toArray: () => Promise.resolve([]), get: () => Promise.resolve(null) },
  purchases: { toArray: () => Promise.resolve([]), get: () => Promise.resolve(null) },
  customers: { toArray: () => Promise.resolve([]), get: () => Promise.resolve(null) },
  vendors: { toArray: () => Promise.resolve([]), get: () => Promise.resolve(null) },
  products: { toArray: () => Promise.resolve([]), get: () => Promise.resolve(null), where: () => ({ equals: () => ({ first: () => Promise.resolve(null), toArray: () => Promise.resolve([]) }) }) },
  payments: { toArray: () => Promise.resolve([]), get: () => Promise.resolve(null), where: () => ({ equals: () => ({ and: () => ({ toArray: () => Promise.resolve([]) }), toArray: () => Promise.resolve([]) }) }) },
  categories: { toArray: () => Promise.resolve([]), get: () => Promise.resolve(null) },
  subCategories: { toArray: () => Promise.resolve([]), get: () => Promise.resolve(null) },
  settings: { get: () => Promise.resolve(null), put: () => Promise.resolve() },
  audit_logs: { add: () => Promise.resolve() },
  attendance_log: { where: () => ({ equals: () => ({ first: () => Promise.resolve(null) }) }), orderBy: () => ({ reverse: () => ({ limit: () => ({ toArray: () => Promise.resolve([]) }), toArray: () => Promise.resolve([]) }) }) },
  bulk_upload_logs: { add: () => Promise.resolve() },
  transaction: () => Promise.resolve(),
};

import { logger } from '@/lib/logger';

export const resetDatabase = async () => {
  logger.warn('DEPRECATED_FUNCTION_CALL', { function: 'resetDatabase', message: 'Data managed by backend API' });
};
