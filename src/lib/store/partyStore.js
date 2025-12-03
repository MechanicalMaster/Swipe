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
    },

    addPayment: async (paymentData) => {
        // paymentData.mode should be 'in' (You Got) or 'out' (You Gave)
        const mode = paymentData.mode || 'in';

        const customer = get().customers.find(c => c.id === paymentData.customerId);
        if (customer) {
            let newBalance = customer.balance || 0;
            if (mode === 'in') {
                newBalance -= paymentData.amount;
            } else {
                newBalance += paymentData.amount;
            }

            // Update customer balance
            await db.customers.update(paymentData.customerId, { balance: newBalance });

            // Create payment record in new table
            await db.payments.add({
                transactionNumber: (mode === 'in' ? 'PAYIN-' : 'PAYOUT-') + Date.now().toString().slice(-4),
                date: paymentData.date,
                type: mode === 'in' ? 'IN' : 'OUT',
                partyType: 'CUSTOMER',
                partyId: paymentData.customerId,
                amount: paymentData.amount,
                mode: paymentData.type || 'CASH', // 'CASH', 'UPI', etc.
                notes: paymentData.notes,
                createdAt: new Date().toISOString()
            });

            // Refresh customers to show new balance
            const customers = await db.customers.toArray();
            set({ customers });
        }
    }
}));
