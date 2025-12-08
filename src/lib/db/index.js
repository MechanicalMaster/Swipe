import Dexie from 'dexie';

export const db = new Dexie('SwipeInvoiceDB');

db.version(11).stores({
  invoices: '++id, invoiceNumber, date, customerId, status, balanceDue, type',
  purchases: '++id, purchaseNumber, date, vendorId, status, balanceDue',
  customers: '++id, name, gstin, phone, email, isDeleted',
  vendors: '++id, name, gstin, phone, email, isDeleted',
  products: '++id, name, type, sku, hsn, category, sellingPrice, purchasePrice, taxRate, unit, barcode',
  payments: '++id, transactionNumber, date, type, partyType, partyId',
  payment_allocations: '++id, paymentId, invoiceId',
  audit_logs: '++id, entityType, entityId, action, timestamp',
  attendance_log: '++id, userId, loginDate, loginTimestamp, logoutTimestamp, created_at',
  bulk_upload_logs: '++id, userId, fileName, totalRecords, successCount, failureCount, timestamp',
  categories: '++id, name, type',
  subCategories: '++id, name, categoryId',
  sequences: 'key',
  settings: 'key',
  // New tables for Label Templates
  tag_templates: 'template_id, name, version',
  product_tag_config: '++id, product_id, template_id'
});

export const resetDatabase = async () => {
  await db.delete();
  await db.open();
};
