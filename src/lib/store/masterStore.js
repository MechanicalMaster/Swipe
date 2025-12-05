import { create } from 'zustand';
import { db } from '@/lib/db';

export const useMasterStore = create((set, get) => ({
    categories: [],
    subCategories: [],
    isLoading: false,

    // Categories
    loadCategories: async () => {
        set({ isLoading: true });
        try {
            const categories = await db.categories.toArray();
            set({ categories, isLoading: false });
        } catch (error) {
            console.error('Failed to load categories:', error);
            set({ isLoading: false });
        }
    },

    addCategory: async (name, type = 'product_category') => {
        try {
            const id = await db.categories.add({ name, type });
            set(state => ({ categories: [...state.categories, { id, name, type }] }));
            return id;
        } catch (error) {
            console.error('Failed to add category:', error);
            throw error;
        }
    },

    updateCategory: async (id, updates) => {
        try {
            await db.categories.update(id, updates);
            set(state => ({
                categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
            }));
        } catch (error) {
            console.error('Failed to update category:', error);
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            await db.categories.delete(id);
            // Also delete associated subcategories? Or strict constraint?
            // For now, let's keep it simple, maybe add a warning in UI if needed.
            // But to be clean:
            const subCats = await db.subCategories.where('categoryId').equals(id).toArray();
            const subCatIds = subCats.map(sc => sc.id);
            if (subCatIds.length > 0) {
                await db.subCategories.bulkDelete(subCatIds);
                set(state => ({
                    subCategories: state.subCategories.filter(sc => sc.categoryId !== id)
                }));
            }

            set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
        } catch (error) {
            console.error('Failed to delete category:', error);
            throw error;
        }
    },

    // SubCategories
    loadSubCategories: async () => {
        set({ isLoading: true });
        try {
            const subCategories = await db.subCategories.toArray();
            set({ subCategories, isLoading: false });
        } catch (error) {
            console.error('Failed to load subcategories:', error);
            set({ isLoading: false });
        }
    },

    addSubCategory: async (name, categoryId) => {
        try {
            const id = await db.subCategories.add({ name, categoryId });
            set(state => ({ subCategories: [...state.subCategories, { id, name, categoryId }] }));
            return id;
        } catch (error) {
            console.error('Failed to add subcategory:', error);
            throw error;
        }
    },

    updateSubCategory: async (id, updates) => {
        try {
            await db.subCategories.update(id, updates);
            set(state => ({
                subCategories: state.subCategories.map(sc => sc.id === id ? { ...sc, ...updates } : sc)
            }));
        } catch (error) {
            console.error('Failed to update subcategory:', error);
            throw error;
        }
    },

    deleteSubCategory: async (id) => {
        try {
            await db.subCategories.delete(id);
            set(state => ({ subCategories: state.subCategories.filter(sc => sc.id !== id) }));
        } catch (error) {
            console.error('Failed to delete subcategory:', error);
            throw error;
        }
    },

    getSubCategoriesByCategory: (categoryId) => {
        const state = get();
        // Handle string vs number comparison if needed, usually Dexie IDs are numbers
        return state.subCategories.filter(sc => sc.categoryId == categoryId);
    }
}));
