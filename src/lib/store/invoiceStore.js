import { create } from 'zustand';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

export const useInvoiceStore = create((set, get) => ({
    // Invoice number is now assigned by backend
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    placeOfSupply: '',
    invoiceCopyType: 'Original for Recipient',
    customer: null,
    items: [],
    invoices: [], // List of all invoices
    type: 'INVOICE', // 'INVOICE' | 'PROFORMA' | 'LENDING'
    isLoading: false,
    error: null,

    // New Fields
    details: {
        reference: '',
        notes: '',
        terms: '',
        extraDiscount: 0,
        shippingCharges: 0,
        packagingCharges: 0,
    },
    weightSummary: {
        grossWeight: '',
        netWeight: '',
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

    // Load invoices from backend
    loadInvoices: async () => {
        set({ isLoading: true, error: null });
        try {
            const invoices = await api.invoices.list();
            set({ invoices: invoices.reverse(), isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'invoices', error: error.message });
            set({ error: error.message, isLoading: false });
        }
    },

    // Get single invoice with full details
    getInvoice: async (id) => {
        try {
            return await api.invoices.get(id);
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { type: 'invoice_detail', id, error: error.message });
            throw error;
        }
    },

    // Setters for form state
    setInvoiceNumber: (num) => set({ invoiceNumber: num }),
    setDate: (date) => set({ date }),
    setDueDate: (date) => set({ dueDate: date }),
    setPlaceOfSupply: (pos) => set({ placeOfSupply: pos }),
    setInvoiceCopyType: (type) => set({ invoiceCopyType: type }),
    setCustomer: (customer) => set({ customer }),
    setInvoiceType: (type) => set({ type }),

    setWeightSummary: (field, value) => set((state) => ({
        weightSummary: { ...state.weightSummary, [field]: value }
    })),

    // Load invoice into form for editing
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
        weightSummary: invoice.weightSummary || { grossWeight: '', netWeight: '' },
        toggles: invoice.toggles || { tds: false, tcs: false, rcm: false },
        payment: invoice.payment || { isFullyPaid: false, amountReceived: 0, mode: 'Cash', notes: '' },
        roundOff: invoice.totals?.roundOffAmount !== 0,
        type: invoice.type || 'INVOICE'
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
        invoiceNumber: '', // Backend assigns
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        placeOfSupply: '',
        invoiceCopyType: 'Original for Recipient',
        customer: null,
        items: [],
        details: { reference: '', notes: '', terms: '', extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
        weightSummary: { grossWeight: '', netWeight: '' },
        toggles: { tds: false, tcs: false, rcm: false },
        payment: { isFullyPaid: false, amountReceived: 0, mode: 'Cash', notes: '' },
        roundOff: false,
        type: 'INVOICE'
    }),

    // Item management (local state only)
    addItem: () => set((state) => ({
        items: [...state.items, {
            id: Date.now(), // Temporary local ID
            name: '',
            rate: 0,
            quantity: 1,
            gstRate: 0,
            hsn: '',
            netWeight: 0,
            grossWeight: 0,
            ratePerGram: 0,
            makingChargePerGram: 0,
            purity: ''
        }]
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
            const itemName = product.subCategory || product.name;
            const ratePerGram = Number(product.sellingPrice) || 0;
            // Extract attributes from metal object or fallback
            const makingChargePerGram = Number(product.metal?.makingCharges || product.makingCharges) || 0;
            const grossWeight = Number(product.metal?.grossWeight || product.grossWeight) || 0;
            const netWeight = Number(product.metal?.netWeight || product.netWeight) || 0;
            const purity = product.metal?.purity || product.purity || '';

            return {
                items: [...state.items, {
                    id: Date.now(),
                    productId: product.id,
                    name: itemName,
                    rate: 0,
                    quantity: change,
                    gstRate: 0,
                    hsn: product.hsn || '',
                    grossWeight,
                    netWeight,
                    ratePerGram,
                    makingChargePerGram,
                    purity,
                    // Computed values - backend will recalculate
                    materialValue: netWeight * ratePerGram,
                    makingCharge: netWeight * makingChargePerGram,
                    itemTotal: (netWeight * ratePerGram) + (netWeight * makingChargePerGram)
                }]
            };
        }
        return state;
    }),

    // Save invoice to backend
    saveInvoice: async () => {
        const state = get();
        const { date, dueDate, placeOfSupply, invoiceCopyType, customer, items, details, weightSummary, toggles, payment, id, type } = state;

        if (!customer) throw new Error('Customer is required');

        set({ isLoading: true, error: null });

        // Prepare items for backend
        const preparedItems = items.map(item => ({
            productId: item.productId,
            description: item.name,
            quantity: item.quantity || 1,
            rate: item.ratePerGram || item.rate || 0,
            taxRate: item.gstRate || 3,
            weight: {
                gross: Number(item.grossWeight) || 0,
                net: Number(item.netWeight) || 0
            },
            amount: {
                makingCharges: (Number(item.netWeight) || 0) * (Number(item.makingChargePerGram) || 0),
                stoneCharges: 0
            },
            hsn: item.hsn || '',
            purity: item.purity || ''
        }));

        // Prepare invoice data - backend computes totals
        const invoiceData = {
            customerId: customer.id,
            type: type || 'INVOICE',
            date,
            dueDate,
            placeOfSupply,
            invoiceCopyType,
            customer: {
                name: customer.name,
                phone: customer.phone,
                gstin: customer.gstin,
                address: customer.address
            },
            items: preparedItems,
            details,
            weightSummary,
            toggles,
            roundOff: state.roundOff,
            payment: {
                amountReceived: Number(payment.amountReceived) || 0,
                mode: payment.mode,
                notes: payment.notes
            }
        };

        try {
            let savedInvoice;
            if (id) {
                // Update
                savedInvoice = await api.invoices.update(id, invoiceData);
                logger.audit(LOG_EVENTS.INVOICE_UPDATED, { type: 'invoice', id, invoiceNumber: state.invoiceNumber });
            } else {
                // Create
                savedInvoice = await api.invoices.create(invoiceData);
                logger.audit(LOG_EVENTS.INVOICE_CREATED, { type: 'invoice', invoiceNumber: savedInvoice.invoiceNumber });
            }

            // Reload invoices from backend
            const invoices = await api.invoices.list();
            set({ invoices: invoices.reverse(), isLoading: false });

            return savedInvoice.id;
        } catch (error) {
            logger.error(LOG_EVENTS.INVOICE_SAVE_FAILED, { error: error.message });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteInvoice: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.invoices.delete(id);
            logger.audit(LOG_EVENTS.INVOICE_DELETED, { type: 'invoice', id });
            const invoices = await api.invoices.list();
            set({ invoices: invoices.reverse(), isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_DELETE_ERROR, { store: 'invoices', id, error: error.message });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    // Calculate totals for UI preview only - backend is authoritative
    calculateTotals: () => {
        const { items, details, roundOff, type } = get();
        let subtotal = 0;

        items.forEach(item => {
            let itemTotal = 0;
            if (item.productId || (item.netWeight !== undefined)) {
                const netWeight = Number(item.netWeight) || 0;
                const ratePerGram = Number(item.ratePerGram) || 0;
                const mcPerGram = Number(item.makingChargePerGram) || 0;
                const materialValue = netWeight * ratePerGram;
                const makingCharge = netWeight * mcPerGram;
                itemTotal = (materialValue + makingCharge) * (item.quantity || 1);
            } else {
                itemTotal = (item.rate || 0) * (item.quantity || 1);
            }
            subtotal += itemTotal;
        });

        // LENDING BILL: No pricing
        if (type === 'LENDING') {
            return {
                subtotal: 0, totalTax: 0, total: 0, roundOffAmount: 0,
                rawTotal: 0, cgst: 0, sgst: 0, igst: 0
            };
        }

        // Tax calculation (preview only)
        let cgstAmount = 0, sgstAmount = 0, totalTax = 0;
        if (type !== 'PROFORMA') {
            cgstAmount = (subtotal * 1.5) / 100;
            sgstAmount = (subtotal * 1.5) / 100;
            totalTax = cgstAmount + sgstAmount;
        }

        let total = subtotal + totalTax;
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
            subtotal, totalTax, total: finalTotal, roundOffAmount,
            rawTotal: total, cgst: cgstAmount, sgst: sgstAmount, igst: 0
        };
    },

    clearError: () => set({ error: null }),
}));
