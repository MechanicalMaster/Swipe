import Dexie from 'dexie';

export const db = new Dexie('SwipeInvoiceDB');

db.version(5).stores({
  invoices: '++id, invoiceNumber, date, customerId, status, balanceDue',
  purchases: '++id, purchaseNumber, date, vendorId, status, balanceDue',
  customers: '++id, name, gstin, phone, email, isDeleted',
  vendors: '++id, name, gstin, phone, email, isDeleted',
  products: '++id, name, type, sku, hsn, category, sellingPrice, purchasePrice, taxRate, unit',
  payments: '++id, transactionNumber, date, type, partyType, partyId',
  payment_allocations: '++id, paymentId, invoiceId',
  audit_logs: '++id, entityType, entityId, action, timestamp',
  settings: 'key'
});

export const resetDatabase = async () => {
  await db.delete();
  await db.open();
};
