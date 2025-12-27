/**
 * @jest-environment jsdom
 */

// Mock the API client
jest.mock('@/api/backendClient', () => ({
    api: {
        products: {
            list: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            get: jest.fn(),
        },
        media: {
            upload: jest.fn(),
        },
    },
}));

import { useProductStore } from '../productStore';
import { api } from '@/api/backendClient';

describe('productStore', () => {
    beforeEach(() => {
        // Reset the store state before each test
        useProductStore.setState({
            products: [],
            isLoading: false,
            error: null,
        });
        jest.clearAllMocks();
    });

    describe('loadProducts', () => {
        it('should load products and reverse the order', async () => {
            const mockProducts = [
                { id: 1, name: 'Product 1' },
                { id: 2, name: 'Product 2' },
            ];
            api.products.list.mockResolvedValue(mockProducts);

            const { loadProducts } = useProductStore.getState();
            await loadProducts();

            const state = useProductStore.getState();
            expect(state.products).toEqual([
                { id: 2, name: 'Product 2' },
                { id: 1, name: 'Product 1' },
            ]);
            expect(state.isLoading).toBe(false);
        });

        it('should set isLoading to true while loading', async () => {
            api.products.list.mockImplementation(() => new Promise(() => { })); // Never resolves

            const { loadProducts } = useProductStore.getState();
            loadProducts(); // Don't await

            expect(useProductStore.getState().isLoading).toBe(true);
        });

        it('should handle errors and set error state', async () => {
            api.products.list.mockRejectedValue(new Error('API error'));

            const { loadProducts } = useProductStore.getState();
            await loadProducts();

            const state = useProductStore.getState();
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe('API error');
        });
    });

    describe('addProduct', () => {
        it('should add product via API and update state', async () => {
            const newProduct = { name: 'Gold Ring', category: 'Gold' };
            const savedProduct = { id: 123, ...newProduct, sku: 'GOL-RIN-000001' };

            api.products.create.mockResolvedValue(savedProduct);
            api.products.list.mockResolvedValue([savedProduct]);

            const { addProduct } = useProductStore.getState();
            const result = await addProduct(newProduct);

            expect(api.products.create).toHaveBeenCalledWith(newProduct);
            expect(result).toEqual(savedProduct);

            const state = useProductStore.getState();
            expect(state.products[0]).toEqual(savedProduct);
        });

        it('should handle add errors', async () => {
            api.products.create.mockRejectedValue(new Error('Failed to create'));

            const { addProduct } = useProductStore.getState();

            await expect(addProduct({ name: 'Test' })).rejects.toThrow('Failed to create');
            expect(useProductStore.getState().error).toBe('Failed to create');
        });
    });

    describe('deleteProduct', () => {
        it('should delete product via API and update state', async () => {
            useProductStore.setState({
                products: [
                    { id: 1, name: 'Product 1' },
                    { id: 2, name: 'Product 2' },
                ],
            });

            api.products.delete.mockResolvedValue();
            api.products.list.mockResolvedValue([{ id: 2, name: 'Product 2' }]);

            const { deleteProduct } = useProductStore.getState();
            await deleteProduct(1);

            expect(api.products.delete).toHaveBeenCalledWith(1);
            expect(useProductStore.getState().products).toEqual([
                { id: 2, name: 'Product 2' },
            ]);
        });
    });

    describe('updateProduct', () => {
        it('should update product via API and update state', async () => {
            useProductStore.setState({
                products: [{ id: 1, name: 'Old Name', price: 100 }],
            });

            const updatedProduct = { id: 1, name: 'New Name', price: 100 };
            api.products.update.mockResolvedValue(updatedProduct);
            api.products.list.mockResolvedValue([updatedProduct]);

            const { updateProduct } = useProductStore.getState();
            await updateProduct(1, { name: 'New Name' });

            expect(api.products.update).toHaveBeenCalledWith(1, { name: 'New Name' });
            expect(useProductStore.getState().products[0]).toEqual(updatedProduct);
        });
    });

    describe('clearError', () => {
        it('should clear the error state', () => {
            useProductStore.setState({ error: 'Some error' });

            const { clearError } = useProductStore.getState();
            clearError();

            expect(useProductStore.getState().error).toBeNull();
        });
    });
});
