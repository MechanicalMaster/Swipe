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

            await db.customers.update(paymentData.customerId, { balance: newBalance });

            // Create transaction record
            await db.invoices.add({
                invoiceNumber: (mode === 'in' ? 'PAYIN-' : 'PAYOUT-') + Date.now().toString().slice(-4),
                date: paymentData.date,
                dueDate: paymentData.date,
                customer: { name: customer.name, id: customer.id },
                items: [],
                payment: {
                    isFullyPaid: true,
                    amountReceived: paymentData.amount,
                    mode: paymentData.type,
                    notes: paymentData.notes
                },
                totals: { total: paymentData.amount },
                type: mode === 'in' ? 'payment_in' : 'payment_out',
                status: 'Paid'
            });

            // Refresh customers
            const customers = await db.customers.toArray();
            set({ customers });
        }
    }
}));
