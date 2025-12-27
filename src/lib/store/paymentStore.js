import { create } from 'zustand';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

export const usePaymentStore = create((set, get) => ({
    payments: [],
    isLoading: false,
    error: null,

    loadPayments: async () => {
        set({ isLoading: true, error: null });
        try {
            const payments = await api.payments.list();
            set({ payments: payments.reverse(), isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'payments', error: error.message });
            set({ error: error.message, isLoading: false });
        }
    },

    addPayment: async (payment) => {
        set({ isLoading: true, error: null });
        try {
            // Backend handles balance updates and invoice status changes
            const newPayment = await api.payments.create({
                ...payment,
                // Ensure allocations is included if provided
                allocations: payment.allocations || []
            });

            // Refresh payments list from backend
            const payments = await api.payments.list();
            set({ payments: payments.reverse(), isLoading: false });

            return newPayment.id;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_SAVE_ERROR, { store: 'payment', error: error.message });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deletePayment: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.payments.delete(id);
            const payments = await api.payments.list();
            set({ payments: payments.reverse(), isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_DELETE_ERROR, { store: 'payment', id, error: error.message });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    getPaymentsByParty: async (partyId) => {
        try {
            // Filter payments by party from loaded list
            // Or implement backend filter if available
            const allPayments = get().payments;
            return allPayments.filter(p => p.partyId === partyId);
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'payments_by_party', partyId, error: error.message });
            return [];
        }
    },

    clearError: () => set({ error: null }),
}));
