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
    setInvoice: (invoice) => {
        // Transform API items to form-compatible format
        const transformedItems = (invoice.items || []).map(item => {
            const netWeight = Number(item.weight?.net || item.netWeight) || 0;
            const makingCharges = Number(item.amount?.makingCharges) || 0;
            // Derive makingChargePerGram from total makingCharges
            const makingChargePerGram = netWeight > 0 ? makingCharges / netWeight : 0;

            // API sends composite rate = ratePerGram + mcPerGram
            // So we need to decompose: ratePerGram = rate - mcPerGram
            const compositeRate = Number(item.rate) || 0;
            const ratePerGram = compositeRate - makingChargePerGram;

            return {
                id: item.id || Date.now(),
                productId: item.productId,
                name: item.description || item.name || '',
                rate: compositeRate,
                quantity: item.quantity || 1,
                gstRate: item.taxRate || 3,
                hsn: item.hsn || '',
                grossWeight: Number(item.weight?.gross || item.grossWeight) || 0,
                netWeight: netWeight,
                ratePerGram: ratePerGram,  // Decomposed from composite rate
                makingChargePerGram: makingChargePerGram,
                purity: item.purity || ''
            };
        });

        set({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            date: invoice.date?.split('T')[0] || invoice.date,
            dueDate: (invoice.dueDate || invoice.date)?.split('T')[0] || invoice.dueDate || invoice.date,
            placeOfSupply: invoice.placeOfSupply || '',
            invoiceCopyType: invoice.invoiceCopyType || 'Original for Recipient',
            customer: invoice.customer,
            items: transformedItems,
            details: invoice.details || { reference: '', notes: '', terms: '', extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
            weightSummary: invoice.weightSummary || { grossWeight: '', netWeight: '' },
            toggles: invoice.toggles || { tds: false, tcs: false, rcm: false },
            payment: invoice.payment || { isFullyPaid: false, amountReceived: 0, mode: 'Cash', notes: '' },
            roundOff: invoice.totals?.roundOff !== 0,
            type: invoice.type || 'INVOICE'
        });
    },

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
            const itemName = product.category || product.name;
            const ratePerGram = Number(product.sellingPrice) || 0;
            // Extract attributes from top level
            const makingChargePerGram = Number(product.metal?.makingCharges) || 0;
            const grossWeight = Number(product.grossWeight) || 0;
            const netWeight = Number(product.netWeight) || 0;
            const purity = product.purity || '';

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

        // Prepare items for backend using correct field mapping:
        // - quantity = netWeight (grams)
        // - rate = ratePerGram + makingChargePerGram (composite rate)
        // - taxRate = total GST %
        // Backend calculates: itemSubtotal = quantity * rate
        const preparedItems = items.map(item => {
            const netWeight = Number(item.netWeight) || 0;
            const ratePerGram = Number(item.ratePerGram) || 0;
            const mcPerGram = Number(item.makingChargePerGram) || 0;
            const compositeRate = ratePerGram + mcPerGram;
            const materialValue = netWeight * ratePerGram;
            const makingCharges = netWeight * mcPerGram;

            return {
                productId: item.productId || null,
                description: item.name,
                quantity: netWeight,  // Net weight in grams
                rate: compositeRate,  // Rate/gm + MC/gm
                taxRate: item.gstRate || 3,  // Total GST %
                weight: {
                    gross: Number(item.grossWeight) || 0,
                    net: netWeight
                },
                amount: {
                    makingCharges: makingCharges,
                    materialValue: materialValue,
                    stoneCharges: 0
                },
                hsn: item.hsn || '',
                purity: item.purity || ''
            };
        });

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

    // Calculate totals for UI preview - matches backend logic exactly
    // Backend formula: itemSubtotal = quantity × rate = netWeight × (ratePerGram + mcPerGram)
    calculateTotals: () => {
        const { items, details, roundOff, type } = get();
        let subtotal = 0;
        let totalTax = 0;

        items.forEach(item => {
            const netWeight = Number(item.netWeight) || 0;
            const ratePerGram = Number(item.ratePerGram) || 0;
            const mcPerGram = Number(item.makingChargePerGram) || 0;
            const taxRate = Number(item.gstRate) || 3;

            // Backend formula: itemSubtotal = quantity × rate
            // where quantity = netWeight, rate = ratePerGram + mcPerGram
            const compositeRate = ratePerGram + mcPerGram;
            const itemSubtotal = netWeight * compositeRate;

            // Tax per item
            const itemTax = itemSubtotal * (taxRate / 100);

            subtotal += itemSubtotal;
            totalTax += itemTax;
        });

        // LENDING BILL: No pricing
        if (type === 'LENDING') {
            return {
                subtotal: 0, totalTax: 0, total: 0, roundOffAmount: 0,
                rawTotal: 0, cgst: 0, sgst: 0, igst: 0
            };
        }

        // CGST and SGST are each half of total tax
        const cgstAmount = totalTax / 2;
        const sgstAmount = totalTax / 2;

        // For proforma, no tax
        if (type === 'PROFORMA') {
            totalTax = 0;
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
            subtotal,
            totalTax,
            total: finalTotal,
            roundOffAmount,
            rawTotal: total,
            cgst: type === 'PROFORMA' ? 0 : cgstAmount,
            sgst: type === 'PROFORMA' ? 0 : sgstAmount,
            igst: 0
        };
    },

    clearError: () => set({ error: null }),
}));
