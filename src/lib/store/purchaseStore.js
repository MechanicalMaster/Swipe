import { create } from 'zustand';
import { api } from '@/api/backendClient';

export const usePurchaseStore = create((set, get) => ({
    purchaseNumber: '', // Assigned by backend
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    vendor: null,
    items: [],
    purchases: [], // List of all purchases
    isLoading: false,
    error: null,

    // GST Toggle
    gstEnabled: true,

    // Details
    details: {
        reference: '',
        notes: '',
        terms: '',
        extraDiscount: 0,
        shippingCharges: 0,
        packagingCharges: 0,
    },

    // Weight Summary
    weightSummary: {
        grossWeight: '',
        netWeight: '',
    },

    // Payment tracking
    payment: {
        isFullyPaid: false,
        amountPaid: 0,
        mode: 'Cash',
        notes: '',
    },

    roundOff: false,
    id: null, // For editing

    // Setters
    setPurchaseNumber: (num) => set({ purchaseNumber: num }),
    setDate: (date) => set({ date }),
    setDueDate: (date) => set({ dueDate: date }),
    setVendor: (vendor) => set({ vendor }),
    toggleGst: () => set((state) => ({ gstEnabled: !state.gstEnabled })),
    toggleRoundOff: () => set((state) => ({ roundOff: !state.roundOff })),

    setWeightSummary: (field, value) => set((state) => ({
        weightSummary: { ...state.weightSummary, [field]: value }
    })),

    updateDetails: (field, value) => set((state) => ({
        details: { ...state.details, [field]: value }
    })),

    updatePayment: (field, value) => set((state) => ({
        payment: { ...state.payment, [field]: value }
    })),

    // Load purchases from backend
    loadPurchases: async () => {
        set({ isLoading: true, error: null });
        try {
            const purchases = await api.purchases.list();
            set({ purchases: purchases.reverse(), isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'purchases', error: error.message });
            set({ error: error.message, isLoading: false });
        }
    },

    // Get single purchase
    getPurchase: async (id) => {
        try {
            return await api.purchases.get(id);
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_LOAD_ERROR, { store: 'purchase_get', id, error: error.message });
            throw error;
        }
    },

    // Item management (local state)
    addItem: () => set((state) => ({
        items: [...state.items, {
            id: Date.now(),
            name: '',
            netWeight: 0,
            grossWeight: 0,
            wastage: 0,
            ratePerGram: 0,
            quantity: 1,
            purity: '',
            hsn: '',
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

    duplicateItem: (id) => set((state) => {
        const itemToDuplicate = state.items.find(item => item.id === id);
        if (itemToDuplicate) {
            return {
                items: [...state.items, { ...itemToDuplicate, id: Date.now() }]
            };
        }
        return state;
    }),

    // Calculate totals for UI preview - backend is authoritative
    calculateTotals: () => {
        const { items, details, roundOff, gstEnabled } = get();
        let subtotal = 0;

        items.forEach(item => {
            const netWeight = Number(item.netWeight) || 0;
            const wastage = Number(item.wastage) || 0;
            const effectiveWeight = netWeight + wastage;
            const ratePerGram = Number(item.ratePerGram) || 0;
            const itemTotal = effectiveWeight * ratePerGram * (item.quantity || 1);
            subtotal += itemTotal;
        });

        let cgstAmount = 0, sgstAmount = 0, totalTax = 0;
        if (gstEnabled) {
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

    // Save purchase to backend
    savePurchase: async () => {
        const state = get();
        const { date, dueDate, vendor, items, details, weightSummary, payment, id, gstEnabled } = state;

        if (!vendor) throw new Error('Vendor is required');
        if (items.length === 0) throw new Error('At least one item is required');

        set({ isLoading: true, error: null });

        // Prepare items for backend
        const preparedItems = items.map(item => ({
            name: item.name,
            netWeight: Number(item.netWeight) || 0,
            grossWeight: Number(item.grossWeight) || 0,
            wastage: Number(item.wastage) || 0,
            ratePerGram: Number(item.ratePerGram) || 0,
            quantity: item.quantity || 1,
            purity: item.purity || '',
            hsn: item.hsn || ''
        }));

        const purchaseData = {
            vendorId: vendor.id,
            date,
            dueDate,
            vendor: {
                name: vendor.name,
                phone: vendor.phone,
                gstin: vendor.gstin
            },
            items: preparedItems,
            details,
            weightSummary,
            gstEnabled,
            roundOff: state.roundOff,
            payment: {
                amountPaid: Number(payment.amountPaid) || 0,
                mode: payment.mode,
                notes: payment.notes
            }
        };

        try {
            let savedPurchase;
            if (id) {
                savedPurchase = await api.purchases.update(id, purchaseData);
            } else {
                savedPurchase = await api.purchases.create(purchaseData);
            }

            // Reload purchases from backend
            const purchases = await api.purchases.list();
            set({ purchases: purchases.reverse(), isLoading: false });

            return savedPurchase.id;
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_SAVE_ERROR, { store: 'purchase', error: error.message });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deletePurchase: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.purchases.delete(id);
            const purchases = await api.purchases.list();
            set({ purchases: purchases.reverse(), isLoading: false });
        } catch (error) {
            logger.error(LOG_EVENTS.STORE_DELETE_ERROR, { store: 'purchase', id, error: error.message });
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    resetPurchase: () => set({
        id: null,
        purchaseNumber: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        vendor: null,
        items: [],
        gstEnabled: true,
        details: { reference: '', notes: '', terms: '', extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
        weightSummary: { grossWeight: '', netWeight: '' },
        payment: { isFullyPaid: false, amountPaid: 0, mode: 'Cash', notes: '' },
        roundOff: false
    }),

    setPurchase: (purchase) => set({
        id: purchase.id,
        purchaseNumber: purchase.purchaseNumber,
        date: purchase.date,
        dueDate: purchase.dueDate || purchase.date,
        vendor: purchase.vendor,
        items: purchase.items,
        gstEnabled: purchase.gstEnabled !== false,
        details: purchase.details || { reference: '', notes: '', terms: '', extraDiscount: 0, shippingCharges: 0, packagingCharges: 0 },
        weightSummary: purchase.weightSummary || { grossWeight: '', netWeight: '' },
        payment: purchase.payment || { isFullyPaid: false, amountPaid: 0, mode: 'Cash', notes: '' },
        roundOff: purchase.totals?.roundOffAmount !== 0
    }),

    clearError: () => set({ error: null }),
}));
