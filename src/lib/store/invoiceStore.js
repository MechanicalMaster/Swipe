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

            // Default rate: Use sellingPrice as fallback for ratePerGram if not explicitly defined in product (assuming product table doesn't have ratePerGram yet, using sellingPrice)
            // The prompt says "Rate Per Gram... Default value can be blank or system-defined". We'll use sellingPrice.
            const ratePerGram = Number(product.sellingPrice) || 0;

            // Making Charge: The prompt implies this is a new input, or fetched. 
            // We'll check if product has makingCharges, else 0.
            const makingChargePerGram = Number(product.makingCharges) || 0;

            // Weights
            const grossWeight = Number(product.grossWeight) || 0;
            const netWeight = Number(product.netWeight) || 0;

            return {
                items: [...state.items, {
                    id: Date.now(),
                    productId: product.id,
                    name: itemName,
                    rate: 0, // Legacy field, might not be used directly in new calculation but keeping for compatibility
                    quantity: change,
                    gstRate: 0, // New tax logic doesn't use per-item GST rate
                    hsn: product.hsn || '',

                    // Jewellery Fields
                    grossWeight,
                    netWeight,
                    ratePerGram,
                    makingChargePerGram,
                    purity: product.purity || '',

                    // Computed initial values (will be recalculated by calculateTotals usage in UI/save, but good to init)
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
        const { invoiceNumber, date, dueDate, placeOfSupply, invoiceCopyType, customer, items, details, toggles, payment, id } = state;

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
            toggles,
            totals,
            status,
            balanceDue,

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

        // Tax Calculation (Invoice Level)
        // CGST = 1.5%, SGST = 1.5%
        const cgstRate = 1.5;
        const sgstRate = 1.5;

        const cgstAmount = (subtotal * cgstRate) / 100;
        const sgstAmount = (subtotal * sgstRate) / 100;
        const totalTax = cgstAmount + sgstAmount;

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
