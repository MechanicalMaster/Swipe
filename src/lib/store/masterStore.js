import { create } from 'zustand';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

export const useMasterStore = create((set, get) => ({
    categories: [],
    subCategories: [],
    isLoading: false,
    error: null,

    // Categories
    loadCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const categories = await api.categories.list();

            // Backend returns categories with embedded subcategories
            // Extract subcategories into flat list for compatibility
            const allSubCategories = [];
            categories.forEach(cat => {
                if (cat.subcategories) {
                    cat.subcategories.forEach(sub => {
                        allSubCategories.push({
                            ...sub,
                            categoryId: cat.id
                        });
                    });
                }
            });

            set({ categories, subCategories: allSubCategories, isLoading: false });
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
            // Backend cascades delete to subcategories
            await api.categories.delete(id);
            set(state => ({
                categories: state.categories.filter(c => c.id !== id),
                subCategories: state.subCategories.filter(sc => sc.categoryId !== id)
            }));
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_DELETE_ERROR, { store: 'category', id, error: error.message });
            throw error;
        }
    },

    // SubCategories
    loadSubCategories: async () => {
        // Subcategories are loaded with categories
        // This is a no-op for API compatibility
        await get().loadCategories();
    },

    addSubCategory: async (name, categoryId) => {
        try {
            const newSubCategory = await api.categories.addSubcategory(categoryId, { name });
            set(state => ({
                subCategories: [...state.subCategories, { ...newSubCategory, categoryId }]
            }));
            return newSubCategory.id;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_SAVE_ERROR, { store: 'subcategory', error: error.message });
            throw error;
        }
    },

    updateSubCategory: async (id, updates) => {
        try {
            // Find the category this subcategory belongs to
            const subCategory = get().subCategories.find(sc => sc.id === id);
            if (!subCategory) throw new Error('Subcategory not found');

            // Note: API may need PUT endpoint for subcategories
            // For now, update local state optimistically
            set(state => ({
                subCategories: state.subCategories.map(sc =>
                    sc.id === id ? { ...sc, ...updates } : sc
                )
            }));
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_UPDATE_ERROR, { store: 'subcategory', id, error: error.message });
            throw error;
        }
    },

    deleteSubCategory: async (id) => {
        try {
            // Find the category this subcategory belongs to
            const subCategory = get().subCategories.find(sc => sc.id === id);
            if (!subCategory) throw new Error('Subcategory not found');

            await api.categories.deleteSubcategory(subCategory.categoryId, id);
            set(state => ({
                subCategories: state.subCategories.filter(sc => sc.id !== id)
            }));
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_DELETE_ERROR, { store: 'subcategory', id, error: error.message });
            throw error;
        }
    },

    getSubCategoriesByCategory: (categoryId) => {
        const state = get();
        return state.subCategories.filter(sc =>
            sc.categoryId === categoryId || sc.categoryId === parseInt(categoryId)
        );
    },

    clearError: () => set({ error: null }),
}));
