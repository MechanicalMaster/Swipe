import Dexie from 'dexie';

export const db = new Dexie('SwipeInvoiceDB');

db.version(4).stores({
  invoices: '++id, invoiceNumber, date, customerId, status',
  purchases: '++id, purchaseNumber, date, vendorId, status',
  customers: '++id, name, gstin',
  vendors: '++id, name, gstin',
  products: '++id, name, type, sellingPrice, purchasePrice, taxRate, unit, hsn, category', // Updated products table
  settings: 'key'
});

export const resetDatabase = async () => {
  await db.delete();
  await db.open();
};
