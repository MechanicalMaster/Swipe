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
    type: 'INVOICE', // 'INVOICE' | 'PROFORMA'

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
        invoiceNumber: 'INV-' + Date.now().toString().slice(-4), // Should be overwritten by useEffect in Create page ideally
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

    addItem: () => set((state) => ({
        items: [...state.items, {
            id: Date.now(),
            name: '',
            rate: 0,
            quantity: 1,
            gstRate: 0,
            hsn: '',

            // Manual Item Defaults
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
            // Auto-fill logic for Jewellery
            // Name fallback: SubCategory -> Name
            const itemName = product.subCategory || product.name;

            // Default rate: Use sellingPrice as fallback for ratePerGram if not explicitly defined in product
            const ratePerGram = Number(product.sellingPrice) || 0;

            // Making Charge
            const makingChargePerGram = Number(product.makingCharges) || 0;

            // Weights
            const grossWeight = Number(product.grossWeight) || 0;
            const netWeight = Number(product.netWeight) || 0;

            return {
                items: [...state.items, {
                    id: Date.now(),
                    productId: product.id,
                    name: itemName,
                    rate: 0, // Legacy field
                    quantity: change,
                    gstRate: 0, // New logic doesn't use per-item GST rate
                    hsn: product.hsn || '',

                    // Jewellery Fields
                    grossWeight,
                    netWeight,
                    ratePerGram,
                    makingChargePerGram,
                    purity: product.purity || '',

                    // Computed initial values
                    materialValue: netWeight * ratePerGram,
                    makingCharge: netWeight * makingChargePerGram,
                    itemTotal: (netWeight * ratePerGram) + (netWeight * makingChargePerGram)
                }]
            };
        }
        return state;
    }),

    saveInvoice: async () => {
        const state = get();
        const { invoiceNumber, date, dueDate, placeOfSupply, invoiceCopyType, customer, items, details, weightSummary, toggles, payment, id, type } = state;

        if (!customer) throw new Error('Customer is required');

        // Calculate totals dynamically to ensure accuracy and avoid undefined state
        const totals = state.calculateTotals();

        const balanceDue = totals.total - (payment.amountReceived || 0);
        const status = balanceDue <= 0 ? 'Paid' : (payment.amountReceived > 0 ? 'Partial' : 'Unpaid');

        // Prepare items with computed values for persistence
        const persistedItems = items.map(item => {
            // Re-calculate line item totals to be sure
            const matVal = (Number(item.netWeight) || 0) * (Number(item.ratePerGram) || 0);
            const mc = (Number(item.netWeight) || 0) * (Number(item.makingChargePerGram) || 0);
            const itemTotal = matVal + mc;

            return {
                ...item,
                materialValue: matVal,
                makingCharge: mc,
                itemTotal: itemTotal
            };
        });

        const invoiceData = {
            invoiceNumber,
            date,
            dueDate,
            placeOfSupply,
            invoiceCopyType,
            customerId: customer.id,
            customer: { name: customer.name, id: customer.id, phone: customer.phone }, // Snapshot
            items: persistedItems,
            details,
            weightSummary,
            toggles,
            totals,
            status: type === 'LENDING' ? 'Pending' : status, // Lending bills are always Pending/Open initially?
            balanceDue,
            type: type || 'INVOICE',

            // specific top-level tax columns for easy querying
            cgstAmount: totals.cgst,
            sgstAmount: totals.sgst,
            totalBeforeTax: totals.subtotal,
            totalAfterTax: totals.total,

            updatedAt: new Date().toISOString()
        };

        return await db.transaction('rw', db.invoices, db.payments, db.payment_allocations, db.customers, async () => {
            let invoiceId = id;

            if (id) {
                await db.invoices.update(id, invoiceData);
            } else {
                invoiceId = await db.invoices.add({ ...invoiceData, createdAt: new Date().toISOString() });
            }

            // Only update payments/balance for regular Invoices.
            // Pro Forma: No balance update.
            // Lending Bill: No balance update (It's a goods loan, not a financial transaction yet).

            if (type !== 'PROFORMA' && type !== 'LENDING') {
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
        const { items, details, roundOff, type } = get();
        let subtotal = 0; // Total Before Tax

        // Calculate line item totals
        items.forEach(item => {
            // Logic: 
            // Material Value = Net Weight * Rate Per Gram
            // Making Charge = Net Weight * Making Charge Per Gram
            // Item Total = Material Value + Making Charge

            // For manual items that might not have weights:
            // Fallback to legacy calc: rate * quantity?
            // Prompt says: "For manual items... allow user to enter: item name, rate, weight, making charge manually."
            // So we assume all items follow the new structure or we support legacy for manual.

            let itemTotal = 0;

            if (item.productId || (item.netWeight !== undefined)) {
                // Jewellery Logic
                const netWeight = Number(item.netWeight) || 0;
                const ratePerGram = Number(item.ratePerGram) || 0;
                const mcPerGram = Number(item.makingChargePerGram) || 0;

                const materialValue = netWeight * ratePerGram;
                const makingCharge = netWeight * mcPerGram;
                itemTotal = materialValue + makingCharge;

                // Consider quantity? Usually jewellery items are unique pieces (qty 1).
                // But if user sets Qty > 1, we should multiply?
                // Prompt "3. Support for Multiple Products... Each line item should independently calculate its own totals".
                // Assuming Qty is effectively 1 per row for specific items, or if Qty > 1, it multiplies totals.
                // Let's multiply by quantity to be safe standard behavior.
                itemTotal = itemTotal * (item.quantity || 1);
            } else {
                // Legacy / Simple Manual Item fallback
                itemTotal = (item.rate || 0) * (item.quantity || 1);
            }

            subtotal += itemTotal;
        });

        // LENDING BILL Logic: No Price, No Tax
        if (type === 'LENDING') {
            return {
                subtotal: 0,
                totalTax: 0,
                total: 0,
                roundOffAmount: 0,
                rawTotal: 0,
                cgst: 0,
                sgst: 0,
                igst: 0
            };
        }

        // Tax Calculation (Invoice Level)
        // If PROFORMA, Tax is 0.
        let cgstAmount = 0;
        let sgstAmount = 0;
        let totalTax = 0;

        if (type !== 'PROFORMA') {
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
            subtotal, // This is Total Before Tax
            totalTax,
            total: finalTotal,
            roundOffAmount,
            rawTotal: total,
            cgst: cgstAmount,
            sgst: sgstAmount,
            igst: 0
        };
    }
}));
