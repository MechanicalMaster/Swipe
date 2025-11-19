import Dexie from 'dexie';

export const db = new Dexie('SwipeInvoiceDB');

db.version(2).stores({
  invoices: '++id, invoiceNumber, date, customerId, status',
  customers: '++id, name, gstin',
  vendors: '++id, name, gstin', // New vendors table
  products: '++id, name, hsn',
  settings: 'key'
});

export const resetDatabase = async () => {
  await db.delete();
  await db.open();
};
