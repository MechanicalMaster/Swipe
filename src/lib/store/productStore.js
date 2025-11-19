import { create } from 'zustand';
import { db } from '@/lib/db';

export const useProductStore = create((set, get) => ({
    products: [],
    isLoading: false,

    loadProducts: async () => {
        set({ isLoading: true });
        try {
            const products = await db.products.toArray();
            set({ products: products.reverse(), isLoading: false });
        } catch (error) {
            console.error('Failed to load products:', error);
            set({ isLoading: false });
        }
    },

    addProduct: async (product) => {
        try {
            const id = await db.products.add({
                ...product,
                createdAt: new Date()
            });
            set((state) => ({ products: [{ ...product, id }, ...state.products] }));
            return id;
        } catch (error) {
            console.error('Failed to add product:', error);
            throw error;
        }
    },

    deleteProduct: async (id) => {
        try {
            await db.products.delete(id);
            set((state) => ({ products: state.products.filter(p => p.id !== id) }));
        } catch (error) {
            console.error('Failed to delete product:', error);
            throw error;
        }
    }
}));
