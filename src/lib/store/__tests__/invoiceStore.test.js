/**
 * @jest-environment jsdom
 */

// Mock the API client
jest.mock('@/api/backendClient', () => ({
    api: {
        invoices: {
            list: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            get: jest.fn(),
        },
    },
}));

import { useInvoiceStore } from '../invoiceStore';
import { api } from '@/api/backendClient';

describe('invoiceStore', () => {
    beforeEach(() => {
        // Reset to default state
        useInvoiceStore.getState().resetInvoice();
        jest.clearAllMocks();
    });

    describe('calculateTotals', () => {
        describe('with jewellery items', () => {
            it('should calculate item total from weight and rate', () => {
                useInvoiceStore.setState({
                    items: [{
                        id: 1,
                        productId: 100,
                        netWeight: 10, // 10 grams
                        ratePerGram: 5000, // ₹5000 per gram
                        makingChargePerGram: 500, // ₹500 per gram
                        quantity: 1,
                    }],
                    type: 'INVOICE',
                    roundOff: false,
                    details: { extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
                });

                const { calculateTotals } = useInvoiceStore.getState();
                const totals = calculateTotals();

                // Material Value = 10 * 5000 = 50000
                // Making Charge = 10 * 500 = 5000
                // Subtotal = 55000
                expect(totals.subtotal).toBe(55000);

                // Tax = 1.5% CGST + 1.5% SGST = 3% = 1650
                expect(totals.cgst).toBe(825);
                expect(totals.sgst).toBe(825);
                expect(totals.totalTax).toBe(1650);

                // Total = 55000 + 1650 = 56650
                expect(totals.total).toBe(56650);
            });

            it('should handle multiple items', () => {
                useInvoiceStore.setState({
                    items: [
                        {
                            id: 1,
                            productId: 100,
                            netWeight: 10,
                            ratePerGram: 5000,
                            makingChargePerGram: 500,
                            quantity: 1,
                        },
                        {
                            id: 2,
                            productId: 101,
                            netWeight: 5,
                            ratePerGram: 6000,
                            makingChargePerGram: 600,
                            quantity: 1,
                        },
                    ],
                    type: 'INVOICE',
                    roundOff: false,
                    details: { extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
                });

                const totals = useInvoiceStore.getState().calculateTotals();

                // Item 1: 10 * (5000 + 500) = 55000
                // Item 2: 5 * (6000 + 600) = 33000
                // Subtotal = 88000
                expect(totals.subtotal).toBe(88000);
            });

            it('should multiply by quantity', () => {
                useInvoiceStore.setState({
                    items: [{
                        id: 1,
                        productId: 100,
                        netWeight: 10,
                        ratePerGram: 1000,
                        makingChargePerGram: 100,
                        quantity: 2,
                    }],
                    type: 'INVOICE',
                    roundOff: false,
                    details: { extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
                });

                const totals = useInvoiceStore.getState().calculateTotals();

                // Per piece: 10 * (1000 + 100) = 11000
                // x2 quantity = 22000
                expect(totals.subtotal).toBe(22000);
            });
        });

        describe('with extra charges and discounts', () => {
            it('should add shipping and packaging charges', () => {
                useInvoiceStore.setState({
                    items: [{
                        id: 1,
                        productId: 100,
                        netWeight: 10,
                        ratePerGram: 1000,
                        makingChargePerGram: 0,
                        quantity: 1,
                    }],
                    type: 'INVOICE',
                    roundOff: false,
                    details: {
                        extraDiscount: 0,
                        shippingCharges: 500,
                        packagingCharges: 200,
                    },
                });

                const totals = useInvoiceStore.getState().calculateTotals();

                // Subtotal = 10000
                // Tax = 300
                // + Shipping 500 + Packaging 200 = 11000
                expect(totals.total).toBe(10000 + 300 + 500 + 200);
            });

            it('should subtract extra discount', () => {
                useInvoiceStore.setState({
                    items: [{
                        id: 1,
                        productId: 100,
                        netWeight: 10,
                        ratePerGram: 1000,
                        makingChargePerGram: 0,
                        quantity: 1,
                    }],
                    type: 'INVOICE',
                    roundOff: false,
                    details: {
                        extraDiscount: 1000,
                        shippingCharges: 0,
                        packagingCharges: 0,
                    },
                });

                const totals = useInvoiceStore.getState().calculateTotals();

                // Subtotal = 10000, Tax = 300, Discount = -1000
                expect(totals.total).toBe(10000 + 300 - 1000);
            });
        });

        describe('round off', () => {
            it('should round total when roundOff is enabled', () => {
                useInvoiceStore.setState({
                    items: [{
                        id: 1,
                        productId: 100,
                        netWeight: 1,
                        ratePerGram: 1000,
                        makingChargePerGram: 0,
                        quantity: 1,
                    }],
                    type: 'INVOICE',
                    roundOff: true,
                    details: { extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
                });

                const totals = useInvoiceStore.getState().calculateTotals();

                // Subtotal = 1000, Tax = 30, Total = 1030 (already round)
                expect(totals.total).toBe(1030);
                expect(totals.roundOffAmount).toBe(0);
            });

            it('should calculate round off amount correctly', () => {
                useInvoiceStore.setState({
                    items: [{
                        id: 1,
                        productId: 100,
                        netWeight: 1,
                        ratePerGram: 1001,
                        makingChargePerGram: 0,
                        quantity: 1,
                    }],
                    type: 'INVOICE',
                    roundOff: true,
                    details: { extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
                });

                const totals = useInvoiceStore.getState().calculateTotals();

                // Subtotal = 1001, Tax = 30.03, Raw Total = 1031.03
                // Rounded = 1031, roundOffAmount = -0.03
                expect(totals.total).toBe(1031);
                expect(totals.roundOffAmount).toBeCloseTo(-0.03, 2);
            });
        });

        describe('invoice types', () => {
            it('should return zero totals for LENDING type', () => {
                useInvoiceStore.setState({
                    items: [{
                        id: 1,
                        productId: 100,
                        netWeight: 10,
                        ratePerGram: 5000,
                        makingChargePerGram: 500,
                        quantity: 1,
                    }],
                    type: 'LENDING',
                    roundOff: false,
                    details: { extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
                });

                const totals = useInvoiceStore.getState().calculateTotals();

                expect(totals.subtotal).toBe(0);
                expect(totals.totalTax).toBe(0);
                expect(totals.total).toBe(0);
                expect(totals.cgst).toBe(0);
                expect(totals.sgst).toBe(0);
            });

            it('should skip tax for PROFORMA type', () => {
                useInvoiceStore.setState({
                    items: [{
                        id: 1,
                        productId: 100,
                        netWeight: 10,
                        ratePerGram: 1000,
                        makingChargePerGram: 0,
                        quantity: 1,
                    }],
                    type: 'PROFORMA',
                    roundOff: false,
                    details: { extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
                });

                const totals = useInvoiceStore.getState().calculateTotals();

                expect(totals.subtotal).toBe(10000);
                expect(totals.totalTax).toBe(0);
                expect(totals.cgst).toBe(0);
                expect(totals.sgst).toBe(0);
                expect(totals.total).toBe(10000);
            });
        });

        describe('legacy items (without productId)', () => {
            it('should use rate * quantity for legacy items', () => {
                useInvoiceStore.setState({
                    items: [{
                        id: 1,
                        name: 'Manual Item',
                        rate: 500,
                        quantity: 3,
                        // No productId or netWeight
                    }],
                    type: 'INVOICE',
                    roundOff: false,
                    details: { extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
                });

                const totals = useInvoiceStore.getState().calculateTotals();

                // rate * quantity = 500 * 3 = 1500
                expect(totals.subtotal).toBe(1500);
            });
        });
    });

    describe('item management', () => {
        it('should add empty item with addItem', () => {
            const { addItem } = useInvoiceStore.getState();
            addItem();

            const items = useInvoiceStore.getState().items;
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(expect.objectContaining({
                name: '',
                rate: 0,
                quantity: 1,
            }));
        });

        it('should update item field with updateItem', () => {
            useInvoiceStore.setState({
                items: [{ id: 1, name: 'Test', quantity: 1 }],
            });

            const { updateItem } = useInvoiceStore.getState();
            updateItem(1, 'quantity', 5);

            expect(useInvoiceStore.getState().items[0].quantity).toBe(5);
        });

        it('should remove item with removeItem', () => {
            useInvoiceStore.setState({
                items: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                ],
            });

            const { removeItem } = useInvoiceStore.getState();
            removeItem(1);

            const items = useInvoiceStore.getState().items;
            expect(items.length).toBe(1);
            expect(items[0].name).toBe('Item 2');
        });
    });

    describe('addOrUpdateItem', () => {
        it('should add new product to items', () => {
            const product = {
                id: 100,
                name: 'Gold Ring',
                subCategory: 'Ring',
                sellingPrice: 5000,
                makingCharges: 500,
                grossWeight: 12,
                netWeight: 10,
                hsn: '7113',
                purity: '22K',
            };

            const { addOrUpdateItem } = useInvoiceStore.getState();
            addOrUpdateItem(product, 1);

            const items = useInvoiceStore.getState().items;
            expect(items.length).toBe(1);
            expect(items[0]).toEqual(expect.objectContaining({
                productId: 100,
                name: 'Ring', // Uses subCategory
                ratePerGram: 5000,
                makingChargePerGram: 500,
                grossWeight: 12,
                netWeight: 10,
                hsn: '7113',
                purity: '22K',
                quantity: 1,
            }));
        });

        it('should increment quantity for existing product', () => {
            useInvoiceStore.setState({
                items: [{
                    id: 1,
                    productId: 100,
                    name: 'Ring',
                    quantity: 2,
                }],
            });

            const { addOrUpdateItem } = useInvoiceStore.getState();
            addOrUpdateItem({ id: 100 }, 1);

            expect(useInvoiceStore.getState().items[0].quantity).toBe(3);
        });

        it('should remove item when quantity goes to zero', () => {
            useInvoiceStore.setState({
                items: [{
                    id: 1,
                    productId: 100,
                    name: 'Ring',
                    quantity: 1,
                }],
            });

            const { addOrUpdateItem } = useInvoiceStore.getState();
            addOrUpdateItem({ id: 100 }, -1);

            expect(useInvoiceStore.getState().items.length).toBe(0);
        });
    });

    describe('resetInvoice', () => {
        it('should reset all fields to defaults', () => {
            useInvoiceStore.setState({
                customer: { id: 1, name: 'Test' },
                items: [{ id: 1 }],
                type: 'PROFORMA',
            });

            const { resetInvoice } = useInvoiceStore.getState();
            resetInvoice();

            const state = useInvoiceStore.getState();
            expect(state.customer).toBeNull();
            expect(state.items).toEqual([]);
            expect(state.type).toBe('INVOICE');
        });
    });

    describe('API operations', () => {
        it('should load invoices from API', async () => {
            const mockInvoices = [
                { id: 1, invoiceNumber: 'INV-001' },
                { id: 2, invoiceNumber: 'INV-002' },
            ];
            api.invoices.list.mockResolvedValue(mockInvoices);

            const { loadInvoices } = useInvoiceStore.getState();
            await loadInvoices();

            expect(api.invoices.list).toHaveBeenCalled();
            expect(useInvoiceStore.getState().invoices).toEqual([
                { id: 2, invoiceNumber: 'INV-002' },
                { id: 1, invoiceNumber: 'INV-001' },
            ]);
        });

        it('should get single invoice from API', async () => {
            const mockInvoice = { id: 1, invoiceNumber: 'INV-001' };
            api.invoices.get.mockResolvedValue(mockInvoice);

            const { getInvoice } = useInvoiceStore.getState();
            const result = await getInvoice(1);

            expect(api.invoices.get).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockInvoice);
        });
    });
});
