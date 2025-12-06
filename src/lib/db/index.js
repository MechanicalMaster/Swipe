import Dexie from 'dexie';

export const db = new Dexie('SwipeInvoiceDB');

db.version(9).stores({
  invoices: '++id, invoiceNumber, date, customerId, status, balanceDue, type',
  purchases: '++id, purchaseNumber, date, vendorId, status, balanceDue',
  customers: '++id, name, gstin, phone, email, isDeleted',
  vendors: '++id, name, gstin, phone, email, isDeleted',
  products: '++id, name, type, sku, hsn, category, sellingPrice, purchasePrice, taxRate, unit',
  payments: '++id, transactionNumber, date, type, partyType, partyId',
  payment_allocations: '++id, paymentId, invoiceId',
  audit_logs: '++id, entityType, entityId, action, timestamp',
  attendance_log: '++id, userId, loginDate, loginTimestamp, logoutTimestamp, created_at',
  categories: '++id, name, type',
  subCategories: '++id, name, categoryId',
  sequences: 'key', // value
  settings: 'key'
});

export const resetDatabase = async () => {
  await db.delete();
  await db.open();
};
