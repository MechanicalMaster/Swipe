import { create } from 'zustand';
import { db } from '@/lib/db';

export const usePaymentStore = create((set, get) => ({
    payments: [],
    isLoading: false,

    loadPayments: async () => {
        set({ isLoading: true });
        try {
            const payments = await db.payments.toArray();
            set({ payments: payments.reverse(), isLoading: false });
        } catch (error) {
            console.error('Failed to load payments:', error);
            set({ isLoading: false });
        }
    },

    addPayment: async (payment) => {
        try {
            // payment object should match schema: 
            // { transactionNumber, date, type, partyType, partyId, amount, mode, notes }

            const id = await db.payments.add({
                ...payment,
                createdAt: new Date().toISOString()
            });

            // Update local state
            set((state) => ({
                payments: [{ ...payment, id }, ...state.payments]
            }));

            // TODO: Update party balance here or in partyStore?
            // Ideally, we trigger a balance refresh in partyStore

            return id;
        } catch (error) {
            console.error('Failed to add payment:', error);
            throw error;
        }
    },

    deletePayment: async (id) => {
        try {
            await db.payments.delete(id);
            set((state) => ({
                payments: state.payments.filter(p => p.id !== id)
            }));
        } catch (error) {
            console.error('Failed to delete payment:', error);
            throw error;
        }
    },

    getPaymentsByParty: async (partyId) => {
        // This might be better as a selector or just filtering the loaded payments
        // For now, let's query DB for efficiency if list is large
        return await db.payments.where('partyId').equals(partyId).toArray();
    }
}));
