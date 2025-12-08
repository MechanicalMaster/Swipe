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

    getProductByBarcode: async (barcode) => {
        try {
            const products = await db.products.where('barcode').equals(barcode).toArray();
            return products.length > 0 ? products[0] : null;
        } catch (error) {
            console.error('Failed to lookup product by barcode:', error);
            return null;
        }
    },

    generateSKU: async (category, subCategory) => {
        if (!category || !subCategory) return '';
        try {
            const catPrefix = category.slice(0, 3).toUpperCase();
            const subPrefix = subCategory.slice(0, 3).toUpperCase();

            // Get current sequence
            let seq = await db.sequences.get('product_sku');
            let nextVal = 1;
            if (seq) {
                nextVal = seq.value + 1;
            }

            // Format: CAT-SUB-000001
            const sequenceStr = nextVal.toString().padStart(6, '0');
            return `${catPrefix}-${subPrefix}-${sequenceStr}`;
        } catch (error) {
            console.error("Failed to generate SKU:", error);
            return '';
        }
    },

    incrementSKUSequence: async () => {
        try {
            const seq = await db.sequences.get('product_sku');
            let nextVal = 1;
            if (seq) {
                nextVal = seq.value + 1;
                await db.sequences.update('product_sku', { value: nextVal });
            } else {
                await db.sequences.add({ key: 'product_sku', value: 1 });
            }
        } catch (error) {
            console.error("Failed to increment SKU sequence:", error);
        }
    },

    addProduct: async (product) => {
        try {
            const id = await db.products.add({
                ...product,
                createdAt: new Date()
            });
            await get().incrementSKUSequence(); // Increment sequence after successful add
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
    },

    updateProduct: async (id, updates) => {
        try {
            await db.products.update(id, updates);
            set((state) => ({
                products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
            }));
        } catch (error) {
            console.error('Failed to update product:', error);
            throw error;
        }
    }
}));
