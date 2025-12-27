import { create } from 'zustand';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

export const usePartyStore = create((set, get) => ({
    parties: [],
    customers: [],
    vendors: [],
    loading: false,
    error: null,

    loadParties: async () => {
        set({ loading: true, error: null });
        try {
            const [customers, vendors] = await Promise.all([
                api.customers.list(),
                api.vendors.list()
            ]);
            set({
                customers: customers || [],
                vendors: vendors || [],
                parties: [...(customers || []), ...(vendors || [])],
                loading: false
            });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'parties', error: error.message });
            set({ error: error.message, loading: false });
        }
    },

    // Customer Actions
    addCustomer: async (customerData) => {
        set({ loading: true });
        try {
            const newCustomer = await api.customers.create(customerData);
            await get().loadParties();
            logger.audit(LOG_EVENTS.PRODUCT_ADD, { type: 'customer', name: customerData.name }); // Reusing generic add event
            set({ loading: false });
            return newCustomer.id;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_SAVE_ERROR, { store: 'customer', error: error.message });
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateCustomer: async (id, customerData) => {
        set({ loading: true });
        try {
            await api.customers.update(id, customerData);
            await get().loadParties();
            logger.audit(LOG_EVENTS.PRODUCT_UPDATE, { type: 'customer', id });
            set({ loading: false });
            return true;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_UPDATE_ERROR, { store: 'customer', id, error: error.message });
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteCustomer: async (id) => {
        set({ loading: true });
        try {
            await api.customers.delete(id);
            await get().loadParties();
            logger.audit(LOG_EVENTS.PRODUCT_DELETE, { type: 'customer', id });
            set({ loading: false });
            return true;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_DELETE_ERROR, { store: 'customer', id, error: error.message });
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    getCustomer: (id) => {
        return get().customers.find(c => c.id === id || c.id === parseInt(id));
    },

    // Vendor Actions
    addVendor: async (vendorData) => {
        set({ loading: true });
        try {
            const newVendor = await api.vendors.create(vendorData);
            await get().loadParties();
            logger.audit(LOG_EVENTS.PRODUCT_ADD, { type: 'vendor', name: vendorData.name });
            set({ loading: false });
            return newVendor.id;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_SAVE_ERROR, { store: 'vendor', error: error.message });
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateVendor: async (id, vendorData) => {
        set({ loading: true });
        try {
            await api.vendors.update(id, vendorData);
            await get().loadParties();
            logger.audit(LOG_EVENTS.PRODUCT_UPDATE, { type: 'vendor', id });
            set({ loading: false });
            return true;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_UPDATE_ERROR, { store: 'vendor', id, error: error.message });
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteVendor: async (id) => {
        set({ loading: true });
        try {
            await api.vendors.delete(id);
            await get().loadParties();
            logger.audit(LOG_EVENTS.PRODUCT_DELETE, { type: 'vendor', id });
            set({ loading: false });
            return true;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_DELETE_ERROR, { store: 'vendor', id, error: error.message });
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    getVendor: (id) => {
        return get().vendors.find(v => v.id === id || v.id === parseInt(id));
    },

    // Payments - now handled via paymentStore
    // Balance is computed by backend, no frontend calculation needed
    addPayment: async (paymentData) => {
        // Redirect to payments API - balance updates handled by backend
        const payment = await api.payments.create({
            type: paymentData.mode === 'in' ? 'IN' : 'OUT',
            partyType: 'CUSTOMER',
            partyId: paymentData.customerId,
            amount: paymentData.amount,
            date: paymentData.date,
            mode: paymentData.type || 'CASH',
            notes: paymentData.notes,
            allocations: paymentData.allocations || []
        });

        // Refresh customers to get updated balance from backend
        const customers = await api.customers.list();
        set({ customers });

        return payment;
    },

    addVendorPayment: async (paymentData) => {
        // Redirect to payments API - balance updates handled by backend
        const payment = await api.payments.create({
            type: paymentData.mode === 'out' ? 'OUT' : 'IN',
            partyType: 'VENDOR',
            partyId: paymentData.vendorId,
            amount: paymentData.amount,
            date: paymentData.date,
            mode: paymentData.type || 'CASH',
            notes: paymentData.notes,
            allocations: paymentData.allocations || []
        });

        // Refresh vendors to get updated balance from backend
        const vendors = await api.vendors.list();
        set({ vendors });

        return payment;
    },

    clearError: () => set({ error: null }),
}));
