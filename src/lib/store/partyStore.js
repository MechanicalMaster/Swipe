import { create } from 'zustand';
import { db } from '@/lib/db';

export const usePartyStore = create((set, get) => ({
    customers: [],
    vendors: [],

    loadParties: async () => {
        const customers = await db.customers.toArray();
        const vendors = await db.vendors.toArray();
        set({ customers, vendors });
    },

    addCustomer: async (customer) => {
        const id = await db.customers.add(customer);
        set((state) => ({ customers: [...state.customers, { ...customer, id }] }));
        return id;
    },

    addVendor: async (vendor) => {
        const id = await db.vendors.add(vendor);
        set((state) => ({ vendors: [...state.vendors, { ...vendor, id }] }));
        return id;
    }
}));
