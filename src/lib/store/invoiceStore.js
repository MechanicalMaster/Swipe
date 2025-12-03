import { create } from 'zustand';
import { db } from '@/lib/db';
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

    saveInvoice: async () => {
        const state = get();
        const { invoiceNumber, date, dueDate, placeOfSupply, invoiceCopyType, customer, items, details, toggles, payment, id } = state;

        if (!customer) throw new Error('Customer is required');

        // Calculate totals dynamically to ensure accuracy and avoid undefined state
        const totals = state.calculateTotals();

        const balanceDue = totals.total - (payment.amountReceived || 0);
        const status = balanceDue <= 0 ? 'Paid' : (payment.amountReceived > 0 ? 'Partial' : 'Unpaid');

        const invoiceData = {
            invoiceNumber,
            date,
            dueDate,
            placeOfSupply,
            invoiceCopyType,
            customerId: customer.id,
            customer: { name: customer.name, id: customer.id, phone: customer.phone }, // Snapshot
            items,
            details,
            toggles,
            totals,
            status,
            balanceDue,
            updatedAt: new Date().toISOString()
        };

        return await db.transaction('rw', db.invoices, db.payments, db.payment_allocations, db.customers, async () => {
            let invoiceId = id;

            if (id) {
                await db.invoices.update(id, invoiceData);
            } else {
                invoiceId = await db.invoices.add({ ...invoiceData, createdAt: new Date().toISOString() });
            }

            // Handle Payment if exists and is new (logic for editing payments is complex, assuming new invoice for now)
            // For now, we only create payment record if it's a NEW invoice and amount > 0. 
            // Editing invoice payment logic is tricky without tracking previous payments.
            // We will assume this is primarily for creation.
            if (!id && payment.amountReceived > 0) {
                const paymentId = await db.payments.add({
                    transactionNumber: 'PAYIN-' + Date.now().toString().slice(-4),
                    date: date,
                    type: 'IN',
                    partyType: 'CUSTOMER',
                    partyId: customer.id,
                    amount: Number(payment.amountReceived),
                    mode: payment.mode,
                    notes: payment.notes,
                    createdAt: new Date().toISOString()
                });

                await db.payment_allocations.add({
                    paymentId,
                    invoiceId,
                    amount: Number(payment.amountReceived)
                });

                // Update Customer Balance
                // We need to fetch current balance first to be safe, or just use atomic update if Dexie supports it (it doesn't for complex math).
                const currentCustomer = await db.customers.get(customer.id);
                if (currentCustomer) {
                    // Invoice increases balance (debit), Payment decreases it (credit)
                    // Net change = Invoice Total - Payment Amount
                    // Wait, usually:
                    // Balance = Receivable.
                    // Invoice created -> Balance increases by Total.
                    // Payment received -> Balance decreases by Amount.
                    // So net change = Total - Amount.
                    const newBalance = (currentCustomer.balance || 0) + totals.total - Number(payment.amountReceived);
                    await db.customers.update(customer.id, { balance: newBalance });
                }
            } else if (!id) {
                // Only Invoice created, no payment
                const currentCustomer = await db.customers.get(customer.id);
                if (currentCustomer) {
                    const newBalance = (currentCustomer.balance || 0) + totals.total;
                    await db.customers.update(customer.id, { balance: newBalance });
                }
            }

            // Reload invoices
            const invoices = await db.invoices.toArray();
            set({ invoices: invoices.reverse() });

            return invoiceId;
        });
    },

    deleteInvoice: async (id) => {
        // TODO: Handle reversing balance changes and deleting linked payments?
        // For now, simple delete to match previous behavior, but we should warn user.
        await db.invoices.delete(id);
        const invoices = await db.invoices.toArray();
        set({ invoices: invoices.reverse() });
    },

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
