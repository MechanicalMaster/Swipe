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
    },

    updateCustomer: async (id, updates) => {
        await db.customers.update(id, updates);
        set((state) => ({
            customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
    },

    deleteCustomer: async (id) => {
        await db.customers.delete(id);
        set((state) => ({
            customers: state.customers.filter(c => c.id !== id)
        }));
    },

    getCustomer: (id) => {
        return get().customers.find(c => c.id === parseInt(id));
    }
}));
