// Mock the database
jest.mock('@/lib/db', () => ({
    db: {
        products: {
            toArray: jest.fn(),
            add: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        },
        sequences: {
            get: jest.fn(),
            add: jest.fn(),
            update: jest.fn(),
        },
    },
}));

import { useProductStore } from '../productStore';
import { db } from '@/lib/db';

describe('productStore', () => {
    beforeEach(() => {
        // Reset the store state before each test
        useProductStore.setState({
            products: [],
            isLoading: false,
        });
        jest.clearAllMocks();
    });

    describe('generateSKU', () => {
        it('should return empty string when category is missing', async () => {
            const { generateSKU } = useProductStore.getState();
            const result = await generateSKU('', 'Ring');
            expect(result).toBe('');
        });

        it('should return empty string when subCategory is missing', async () => {
            const { generateSKU } = useProductStore.getState();
            const result = await generateSKU('Gold', '');
            expect(result).toBe('');
        });

        it('should generate SKU with correct format when no sequence exists', async () => {
            db.sequences.get.mockResolvedValue(null);

            const { generateSKU } = useProductStore.getState();
            const result = await generateSKU('Gold', 'Ring');

            expect(result).toBe('GOL-RIN-000001');
        });

        it('should generate SKU with incremented sequence', async () => {
            db.sequences.get.mockResolvedValue({ key: 'product_sku', value: 42 });

            const { generateSKU } = useProductStore.getState();
            const result = await generateSKU('Silver', 'Necklace');

            expect(result).toBe('SIL-NEC-000043');
        });

        it('should handle errors gracefully', async () => {
            db.sequences.get.mockRejectedValue(new Error('DB error'));

            const { generateSKU } = useProductStore.getState();
            const result = await generateSKU('Gold', 'Ring');

            expect(result).toBe('');
        });
    });

    describe('loadProducts', () => {
        it('should load products and reverse the order', async () => {
            const mockProducts = [
                { id: 1, name: 'Product 1' },
                { id: 2, name: 'Product 2' },
            ];
            db.products.toArray.mockResolvedValue(mockProducts);

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
            db.products.toArray.mockImplementation(() => new Promise(() => { })); // Never resolves

            const { loadProducts } = useProductStore.getState();
            loadProducts(); // Don't await

            expect(useProductStore.getState().isLoading).toBe(true);
        });

        it('should handle errors and set isLoading to false', async () => {
            db.products.toArray.mockRejectedValue(new Error('DB error'));

            const { loadProducts } = useProductStore.getState();
            await loadProducts();

            expect(useProductStore.getState().isLoading).toBe(false);
        });
    });

    describe('addProduct', () => {
        it('should add product to database and state', async () => {
            db.products.add.mockResolvedValue(123);
            db.sequences.get.mockResolvedValue({ key: 'product_sku', value: 1 });
            db.sequences.update.mockResolvedValue(1);

            const newProduct = { name: 'Gold Ring', category: 'Gold' };
            const { addProduct } = useProductStore.getState();
            const id = await addProduct(newProduct);

            expect(id).toBe(123);
            expect(db.products.add).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Gold Ring',
                category: 'Gold',
                createdAt: expect.any(Date),
            }));

            const state = useProductStore.getState();
            expect(state.products[0]).toEqual(expect.objectContaining({
                id: 123,
                name: 'Gold Ring',
            }));
        });
    });

    describe('deleteProduct', () => {
        it('should remove product from database and state', async () => {
            useProductStore.setState({
                products: [
                    { id: 1, name: 'Product 1' },
                    { id: 2, name: 'Product 2' },
                ],
            });
            db.products.delete.mockResolvedValue(undefined);

            const { deleteProduct } = useProductStore.getState();
            await deleteProduct(1);

            expect(db.products.delete).toHaveBeenCalledWith(1);
            expect(useProductStore.getState().products).toEqual([
                { id: 2, name: 'Product 2' },
            ]);
        });
    });

    describe('updateProduct', () => {
        it('should update product in database and state', async () => {
            useProductStore.setState({
                products: [{ id: 1, name: 'Old Name', price: 100 }],
            });
            db.products.update.mockResolvedValue(1);

            const { updateProduct } = useProductStore.getState();
            await updateProduct(1, { name: 'New Name' });

            expect(db.products.update).toHaveBeenCalledWith(1, { name: 'New Name' });
            expect(useProductStore.getState().products[0]).toEqual({
                id: 1,
                name: 'New Name',
                price: 100,
            });
        });
    });

    describe('incrementSKUSequence', () => {
        it('should create sequence if it does not exist', async () => {
            db.sequences.get.mockResolvedValue(null);
            db.sequences.add.mockResolvedValue(1);

            const { incrementSKUSequence } = useProductStore.getState();
            await incrementSKUSequence();

            expect(db.sequences.add).toHaveBeenCalledWith({ key: 'product_sku', value: 1 });
        });

        it('should increment existing sequence', async () => {
            db.sequences.get.mockResolvedValue({ key: 'product_sku', value: 5 });
            db.sequences.update.mockResolvedValue(1);

            const { incrementSKUSequence } = useProductStore.getState();
            await incrementSKUSequence();

            expect(db.sequences.update).toHaveBeenCalledWith('product_sku', { value: 6 });
        });
    });
});
