import { create } from 'zustand';
import { db } from '@/lib/db';

export const usePurchaseStore = create((set, get) => ({
    purchaseNumber: 'PUR-1',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    vendor: null,
    items: [],
    purchases: [], // List of all purchases

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

    // Load purchases from DB
    loadPurchases: async () => {
        const purchases = await db.purchases.toArray();
        set({ purchases: purchases.reverse() });
    },

    // Item management
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

    // Calculate totals
    calculateTotals: () => {
        const { items, details, roundOff, gstEnabled } = get();
        let subtotal = 0;

        // Calculate line item totals
        items.forEach(item => {
            // Effective Weight = Net Weight + Wastage
            const netWeight = Number(item.netWeight) || 0;
            const wastage = Number(item.wastage) || 0;
            const effectiveWeight = netWeight + wastage;

            // Amount = Effective Weight × Rate per gram
            const ratePerGram = Number(item.ratePerGram) || 0;
            const itemTotal = effectiveWeight * ratePerGram * (item.quantity || 1);

            subtotal += itemTotal;
        });

        // Tax Calculation (when GST is enabled)
        let cgstAmount = 0;
        let sgstAmount = 0;
        let totalTax = 0;

        if (gstEnabled) {
            const cgstRate = 1.5;
            const sgstRate = 1.5;

            cgstAmount = (subtotal * cgstRate) / 100;
            sgstAmount = (subtotal * sgstRate) / 100;
            totalTax = cgstAmount + sgstAmount;
        }

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
            cgst: cgstAmount,
            sgst: sgstAmount,
            igst: 0
        };
    },

    // Save purchase to database
    savePurchase: async () => {
        const state = get();
        const { purchaseNumber, date, dueDate, vendor, items, details, weightSummary, payment, id, gstEnabled } = state;

        if (!vendor) throw new Error('Vendor is required');
        if (items.length === 0) throw new Error('At least one item is required');

        // Calculate totals
        const totals = state.calculateTotals();

        const balanceDue = totals.total - (payment.amountPaid || 0);
        const status = balanceDue <= 0 ? 'Paid' : (payment.amountPaid > 0 ? 'Partial' : 'Unpaid');

        // Prepare items with computed values
        const persistedItems = items.map(item => {
            const netWeight = Number(item.netWeight) || 0;
            const wastage = Number(item.wastage) || 0;
            const effectiveWeight = netWeight + wastage;
            const ratePerGram = Number(item.ratePerGram) || 0;
            const itemTotal = effectiveWeight * ratePerGram * (item.quantity || 1);

            return {
                ...item,
                effectiveWeight,
                itemTotal
            };
        });

        const purchaseData = {
            purchaseNumber,
            date,
            dueDate,
            vendorId: vendor.id,
            vendor: { name: vendor.name, id: vendor.id, phone: vendor.phone },
            items: persistedItems,
            details,
            weightSummary,
            gstEnabled,
            totals,
            status,
            balanceDue,

            // Tax columns for easy querying
            cgstAmount: totals.cgst,
            sgstAmount: totals.sgst,
            totalBeforeTax: totals.subtotal,
            totalAfterTax: totals.total,

            updatedAt: new Date().toISOString()
        };

        return await db.transaction('rw', db.purchases, db.payments, db.vendors, async () => {
            let purchaseId = id;

            if (id) {
                await db.purchases.update(id, purchaseData);
            } else {
                purchaseId = await db.purchases.add({ ...purchaseData, createdAt: new Date().toISOString() });
            }

            // Update vendor balance (purchase increases what you owe the vendor)
            if (!id) {
                const currentVendor = await db.vendors.get(vendor.id);
                if (currentVendor) {
                    // Purchase increases balance (you owe more to vendor)
                    // Payment decreases it
                    const newBalance = (currentVendor.balance || 0) + totals.total - Number(payment.amountPaid || 0);
                    await db.vendors.update(vendor.id, { balance: newBalance });
                }

                // Record payment if any
                if (payment.amountPaid > 0) {
                    await db.payments.add({
                        transactionNumber: 'VPAYOUT-' + Date.now().toString().slice(-4),
                        date: date,
                        type: 'OUT',
                        partyType: 'VENDOR',
                        partyId: vendor.id,
                        amount: Number(payment.amountPaid),
                        mode: payment.mode,
                        notes: payment.notes,
                        createdAt: new Date().toISOString()
                    });
                }
            }

            // Reload purchases
            const purchases = await db.purchases.toArray();
            set({ purchases: purchases.reverse() });

            return purchaseId;
        });
    },

    // Delete purchase
    deletePurchase: async (id) => {
        await db.purchases.delete(id);
        const purchases = await db.purchases.toArray();
        set({ purchases: purchases.reverse() });
    },

    // Reset store
    resetPurchase: () => set({
        id: null,
        purchaseNumber: 'PUR-' + Date.now().toString().slice(-4),
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

    // Set purchase for editing
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
    })
}));
