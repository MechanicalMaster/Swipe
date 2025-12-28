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
            const allPayments = get().payments;
            console.log('[paymentStore] getPaymentsByParty called with:', partyId);
            console.log('[paymentStore] All payments:', allPayments.length, allPayments.map(p => ({ id: p.id, partyId: p.partyId, party_id: p.party_id })));

            // Flexible comparison to handle both camelCase and snake_case
            const filtered = allPayments.filter(p => {
                const paymentPartyId = p.partyId || p.party_id;
                return String(paymentPartyId) === String(partyId);
            });

            console.log('[paymentStore] Filtered payments:', filtered.length);
            return filtered;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'payments_by_party', partyId, error: error.message });
            return [];
        }
    },

    clearError: () => set({ error: null }),
}));
