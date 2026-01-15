import { create } from 'zustand';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

export const useMasterStore = create((set, get) => ({
    categories: [],
    isLoading: false,
    error: null,

    // Categories
    loadCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const categories = await api.categories.list();
            set({ categories, isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'categories', error: error.message });
            set({ error: error.message, isLoading: false });
        }
    },

    addCategory: async (name, type = 'product_category') => {
        try {
            const newCategory = await api.categories.create({ name, type });
            set(state => ({ categories: [...state.categories, newCategory] }));
            return newCategory.id;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_SAVE_ERROR, { store: 'category', error: error.message });
            throw error;
        }
    },

    updateCategory: async (id, updates) => {
        try {
            const updatedCategory = await api.categories.update(id, updates);
            set(state => ({
                categories: state.categories.map(c =>
                    c.id === id ? { ...c, ...updatedCategory } : c
                )
            }));
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_UPDATE_ERROR, { store: 'category', id, error: error.message });
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            await api.categories.delete(id);
            set(state => ({
                categories: state.categories.filter(c => c.id !== id)
            }));
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_DELETE_ERROR, { store: 'category', id, error: error.message });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
