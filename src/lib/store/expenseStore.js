import { create } from 'zustand';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

export const useExpenseStore = create((set, get) => ({
    expenses: [],
    categories: [
        'Karigar',
        'Miscellaneous',
        'Transportation & Travel Expense',
        'Telephone & Internet Bills',
        'Repair & Maintenance',
        'Rent Expense',
        'Raw Material',
        'Printing and Stationery',
        'Employee Salaries & Advances',
        'Electricity Bill',
        'Bank Fee and Charges',
    ],
    isLoading: false,
    error: null,

    loadExpenses: async () => {
        set({ isLoading: true, error: null });
        try {
            const expenses = await api.expenses.list();
            set({ expenses: expenses.reverse(), isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'expenses', error: error.message });
            set({ error: error.message, isLoading: false });
        }
    },

    addExpense: async (expense) => {
        set({ isLoading: true, error: null });
        try {
            const newExpense = await api.expenses.create(expense);
            set((state) => ({
                expenses: [newExpense, ...state.expenses],
                isLoading: false
            }));
            return newExpense.id;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_SAVE_ERROR, { store: 'expense', error: error.message });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateExpense: async (id, updatedExpense) => {
        set({ isLoading: true, error: null });
        try {
            const result = await api.expenses.update(id, updatedExpense);
            set((state) => ({
                expenses: state.expenses.map((exp) =>
                    exp.id === id ? { ...exp, ...result } : exp
                ),
                isLoading: false
            }));
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_UPDATE_ERROR, { store: 'expense', id, error: error.message });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteExpense: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.expenses.delete(id);
            set((state) => ({
                expenses: state.expenses.filter((exp) => exp.id !== id),
                isLoading: false
            }));
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_DELETE_ERROR, { store: 'expense', id, error: error.message });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Categories are currently hardcoded
    // If backend supports dynamic categories, these would become API calls
    addCategory: (category) =>
        set((state) => ({
            categories: [...state.categories, category],
        })),

    updateCategory: (oldCategory, newCategory) =>
        set((state) => ({
            categories: state.categories.map((cat) =>
                cat === oldCategory ? newCategory : cat
            ),
            expenses: state.expenses.map((exp) =>
                exp.category === oldCategory ? { ...exp, category: newCategory } : exp
            ),
        })),

    deleteCategory: (category) =>
        set((state) => ({
            categories: state.categories.filter((cat) => cat !== category),
        })),

    clearError: () => set({ error: null }),
}));
