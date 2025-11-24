import { create } from 'zustand';
import { calculateGST } from '../utils/tax';

export const useInvoiceStore = create((set, get) => ({
    invoiceNumber: 'INV-1',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    placeOfSupply: '',
    invoiceCopyType: 'Original for Recipient',
    customer: null,
    items: [],
    invoices: [], // List of all invoices

    loadInvoices: async () => {
        const invoices = await db.invoices.toArray();
        set({ invoices: invoices.reverse() });
    },

    // New Fields
    details: {
        reference: '',
        notes: '',
        terms: '',
        extraDiscount: 0,
        shippingCharges: 0,
        packagingCharges: 0,
    },
    toggles: {
        tds: false,
        tcs: false,
        rcm: false,
    },
    payment: {
        isFullyPaid: false,
        amountReceived: 0,
        mode: 'Cash',
        notes: '',
    },
    roundOff: false,
    id: null, // For editing

    setInvoiceNumber: (num) => set({ invoiceNumber: num }),
    setDate: (date) => set({ date }),
    setDueDate: (date) => set({ dueDate: date }),
    setPlaceOfSupply: (pos) => set({ placeOfSupply: pos }),
    setInvoiceCopyType: (type) => set({ invoiceCopyType: type }),
    setCustomer: (customer) => set({ customer }),

    setInvoice: (invoice) => set({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date,
        dueDate: invoice.dueDate || invoice.date,
        placeOfSupply: invoice.placeOfSupply || '',
        invoiceCopyType: invoice.invoiceCopyType || 'Original for Recipient',
        customer: invoice.customer,
        items: invoice.items,
        details: invoice.details || { reference: '', notes: '', terms: '', extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
        toggles: invoice.toggles || { tds: false, tcs: false, rcm: false },
        payment: invoice.payment || { isFullyPaid: false, amountReceived: 0, mode: 'Cash', notes: '' },
        roundOff: invoice.totals?.roundOffAmount !== 0 // Infer roundOff from totals if not explicitly saved, or just default to false if not present
    }),

    updateDetails: (field, value) => set((state) => ({
        details: { ...state.details, [field]: value }
    })),
    toggleSwitch: (field) => set((state) => ({
        toggles: { ...state.toggles, [field]: !state.toggles[field] }
    })),
    updatePayment: (field, value) => set((state) => ({
        payment: { ...state.payment, [field]: value }
    })),
    toggleRoundOff: () => set((state) => ({ roundOff: !state.roundOff })),

    resetInvoice: () => set({
        id: null,
        invoiceNumber: 'INV-' + Date.now().toString().slice(-4), // Simple auto-increment simulation
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        placeOfSupply: '',
        invoiceCopyType: 'Original for Recipient',
        customer: null,
        items: [],
        details: { reference: '', notes: '', terms: '', extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
        toggles: { tds: false, tcs: false, rcm: false },
        payment: { isFullyPaid: false, amountReceived: 0, mode: 'Cash', notes: '' },
        roundOff: false
    }),

    addItem: () => set((state) => ({
        items: [...state.items, { id: Date.now(), name: '', rate: 0, quantity: 1, gstRate: 18, hsn: '' }]
    })),

    updateItem: (id, field, value) => set((state) => ({
        items: state.items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        )
    })),

    removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
    })),

    addOrUpdateItem: (product, change) => set((state) => {
        const existingItem = state.items.find(item => item.productId === product.id);

        if (existingItem) {
            const newQuantity = existingItem.quantity + change;
            if (newQuantity <= 0) {
                return { items: state.items.filter(item => item.productId !== product.id) };
            }
            return {
                items: state.items.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            };
        } else if (change > 0) {
            return {
                items: [...state.items, {
                    id: Date.now(),
                    productId: product.id,
                    name: product.name,
                    rate: Number(product.sellingPrice) || 0,
                    quantity: change,
                    gstRate: Number(product.taxRate) || 0,
                    hsn: product.hsn || ''
                }]
            };
        }
        return state;
    }),

    calculateTotals: () => {
        const { items, details, roundOff } = get();
        let subtotal = 0;
        let totalTax = 0;

        items.forEach(item => {
            const amount = item.rate * item.quantity;
            const tax = (amount * item.gstRate) / 100;
            subtotal += amount;
            totalTax += tax;
        });

        let total = subtotal + totalTax;

        // Add/Subtract extra charges
        total += Number(details.shippingCharges || 0);
        total += Number(details.packagingCharges || 0);
        total -= Number(details.extraDiscount || 0);

        let finalTotal = total;
        let roundOffAmount = 0;

        if (roundOff) {
            finalTotal = Math.round(total);
            roundOffAmount = finalTotal - total;
        }

        return {
            subtotal,
            totalTax,
            total: finalTotal,
            roundOffAmount,
            rawTotal: total,
            // Tax Breakdown (Simplified assumption: Intra-state if no POS or POS matches company state)
            // In a real app, we'd compare company state vs customer state/POS
            cgst: totalTax / 2,
            sgst: totalTax / 2,
            igst: 0 // Logic to be refined in component or here if we had access to company state
        };
    }
}));
