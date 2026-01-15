'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { usePartyStore } from '@/lib/store/partyStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useEffect } from 'react';
import { formatCurrency } from '@/lib/utils/tax';
import { generatePDF } from '@/lib/utils/pdf';
import { FiPlus, FiTrash2, FiCalendar, FiUser, FiBox, FiArrowLeft, FiCheck, FiLoader } from 'react-icons/fi';
import { useFormValidation } from '@/lib/hooks/formValidation';
import { invoiceSchema } from '@/lib/validation/validationSchemas';
import styles from './InvoiceForm.module.css';

export default function InvoiceForm() {
    const router = useRouter();
    const searchParams = useSearchParams(); // Need to import this
    const prefillCustomerId = searchParams?.get('customerId');
    const { getCustomer } = usePartyStore(); // Need to import this

    const {
        id, invoiceNumber, date, dueDate, placeOfSupply, invoiceCopyType, items, customer,
        details, toggles, payment, roundOff, type, // Add type
        addItem, updateItem, removeItem, calculateTotals,
        updateDetails, toggleSwitch, updatePayment, toggleRoundOff, resetInvoice, saveInvoice,
        setDueDate, setPlaceOfSupply, setInvoiceCopyType, setCustomer
    } = useInvoiceStore();

    useEffect(() => {
        if (prefillCustomerId && !customer) {
            const c = getCustomer(prefillCustomerId);
            if (c) setCustomer(c);
        }
    }, [prefillCustomerId, customer, getCustomer, setCustomer]);

    const totals = calculateTotals();

    // Form validation hook
    const {
        saveStatus,
        lastSavedAtFormatted,
        errors,
        validate,
        startSaving,
        markSaved,
        markFailed,
        clearErrors
    } = useFormValidation(invoiceSchema);

    const handleSave = async () => {
        // Validate visible fields only
        const { success } = validate({ customer, items });
        if (!success) return;

        // Double-submit prevention
        if (!startSaving()) return;

        try {
            const savedId = await saveInvoice();
            markSaved();
            resetInvoice(); // Clear form
            router.push(`/invoice/view?id=${savedId}`);
        } catch (error) {
            markFailed(error);
            console.error('Failed to save invoice:', error);
        }
    };

    const handleDownloadPDF = async () => {
        const { templateId, lendingBillTemplateId } = useSettingsStore.getState();

        await generatePDF({
            invoiceNumber,
            date,
            items,
            totals,
            type,
            templateId: type === 'LENDING' ? (lendingBillTemplateId || 'modern') : (templateId || 'modern')
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.row}>
                    <div>
                        <div className={styles.label}>{type === 'PROFORMA' ? 'Pro Forma #' : type === 'LENDING' ? 'Lending Bill #' : 'Invoice #'}</div>
                        <div className={styles.value}>{invoiceNumber}</div>
                        {type === 'PROFORMA' && <span style={{ fontSize: 10, background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: 4 }}>PRO FORMA</span>}
                        {type === 'LENDING' && <span style={{ fontSize: 10, background: '#f3f4f6', color: '#374151', padding: '2px 6px', borderRadius: 4 }}>LENDING BILL</span>}
                    </div>
                    <div className={styles.value} style={{ color: 'var(--primary)' }}>Edit</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Date</div>
                    <input type="date" className={styles.input} value={date} onChange={(e) => useInvoiceStore.getState().setDate(e.target.value)} />
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Due Date</div>
                    <input type="date" className={styles.input} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>

            </div>

            <div className={styles.sectionTitle}>
                Customer <FiUser size={14} />
            </div>
            <div className={styles.card}>
                {customer ? (
                    <div className={styles.selectedCustomer}>
                        <div className={styles.customerInfo}>
                            <div className={styles.customerName}>{customer.name}</div>
                            {customer.phone && <div className={styles.customerPhone}>{customer.phone}</div>}
                        </div>
                        <div className={styles.customerActions}>
                            <button
                                className={styles.actionButton}
                                onClick={() => router.push('/invoice/create/select-customer')}
                            >
                                View
                            </button>
                            <button
                                className={styles.actionButton}
                                onClick={() => router.push('/invoice/create/select-customer')}
                            >
                                Change
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        className={styles.addButton}
                        onClick={() => router.push('/invoice/create/select-customer')}
                    >
                        <FiPlus /> Select Customer
                    </button>
                )}
                {errors.customer && <div className={styles.fieldError}>{errors.customer}</div>}
            </div>

            <div className={styles.sectionTitle}>
                Products <FiBox size={14} />
            </div>
            {/* Products List with Jewellery Fields */}
            <div className={styles.card}>
                {type !== 'LENDING' && (
                    <button
                        className={styles.addButton}
                        onClick={() => router.push('/invoice/create/select-product')}
                        style={{ marginBottom: '12px' }}
                    >
                        <FiPlus /> Select Products
                    </button>
                )}

                {items.map((item) => (
                    <div key={item.id} className={styles.itemRow} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 16 }}>
                        <div className={styles.itemHeader} style={{ marginBottom: 8, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                {type === 'LENDING' ? (
                                    <div style={{ marginBottom: 8 }}>
                                        <label style={{ fontSize: 10, color: '#6b7280', display: 'block', marginBottom: 4 }}>Item Description / Category</label>
                                        <input
                                            className={styles.input}
                                            value={item.name}
                                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                            placeholder="Enter Item Description (e.g. Gold Ring)"
                                        />
                                    </div>
                                ) : (
                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                )}
                            </div>
                            <button onClick={() => removeItem(item.id)} style={{ color: 'red', border: 'none', background: 'none', marginLeft: 8, padding: 4 }}>
                                <FiTrash2 />
                            </button>
                        </div>

                        {type === 'LENDING' ? (
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ width: 100 }}>
                                    <label style={{ fontSize: 10, color: '#6b7280' }}>Quantity</label>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                        placeholder="1"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Row 1: Weights (Read Only) */}
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 10, color: '#6b7280' }}>Gross Wt</label>
                                        <input
                                            className={styles.input}
                                            value={item.grossWeight || ''}
                                            readOnly
                                            placeholder="0"
                                            style={{ background: '#f9fafb' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 10, color: '#6b7280' }}>Net Wt (g)</label>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            value={item.netWeight || ''}
                                            onChange={(e) => updateItem(item.id, 'netWeight', e.target.value)}
                                            placeholder="0"
                                            // Manual items might need editable weight
                                            readOnly={!!item.productId}
                                            style={{ background: item.productId ? '#f9fafb' : 'white' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 10, color: '#6b7280' }}>Purity</label>
                                        <input
                                            className={styles.input}
                                            value={item.purity || ''}
                                            readOnly
                                            placeholder="-"
                                            style={{ background: '#f9fafb' }}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Pricing Inputs */}
                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 10, color: '#6b7280' }}>Rate/gm</label>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            value={item.ratePerGram || ''}
                                            onChange={(e) => updateItem(item.id, 'ratePerGram', e.target.value)}
                                            placeholder="Rate"
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: 10, color: '#6b7280' }}>MC/gm</label>
                                        <input
                                            className={styles.input}
                                            type="number"
                                            value={item.makingChargePerGram || ''}
                                            onChange={(e) => updateItem(item.id, 'makingChargePerGram', e.target.value)}
                                            placeholder="MC"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Totals (Computed) */}
                                <div style={{ display: 'flex', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 6 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 10, color: '#6b7280' }}>Mat. Value</div>
                                        <div style={{ fontSize: 12, fontWeight: 500 }}>
                                            {formatCurrency((Number(item.netWeight) || 0) * (Number(item.ratePerGram) || 0))}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 10, color: '#6b7280' }}>Making Chg</div>
                                        <div style={{ fontSize: 12, fontWeight: 500 }}>
                                            {formatCurrency((Number(item.netWeight) || 0) * (Number(item.makingChargePerGram) || 0))}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'right' }}>
                                        <div style={{ fontSize: 10, color: '#6b7280' }}>Total</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>
                                            {formatCurrency(
                                                ((Number(item.netWeight) || 0) * (Number(item.ratePerGram) || 0)) +
                                                ((Number(item.netWeight) || 0) * (Number(item.makingChargePerGram) || 0))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}

                <button
                    className={styles.addButton}
                    onClick={() => {
                        useInvoiceStore.getState().addItem();
                    }}
                    style={{ background: 'white', border: '1px solid #e5e7eb', color: '#4b5563' }}
                >
                    <FiPlus /> {type === 'LENDING' ? 'Add Item' : 'Add Manual Item'}
                </button>
            </div>

            {/* Weight Summary for Lending Bill */}
            {type === 'LENDING' && (
                <>
                    <div className={styles.sectionTitle}>
                        Weight Summary <FiBox size={14} />
                    </div>
                    <div className={styles.card}>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label className={styles.label}>Gross Weight (g)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={useInvoiceStore.getState().weightSummary?.grossWeight || ''}
                                    onChange={(e) => useInvoiceStore.getState().setWeightSummary('grossWeight', e.target.value)}
                                    placeholder="0.000"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className={styles.label}>Net Weight (g)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={useInvoiceStore.getState().weightSummary?.netWeight || ''}
                                    onChange={(e) => useInvoiceStore.getState().setWeightSummary('netWeight', e.target.value)}
                                    placeholder="0.000"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Optional Fields */}
            <div className={styles.sectionTitle}>Optional</div>
            <div className={styles.card} style={{ padding: 0 }}>
                {[
                    { icon: '📄', label: 'Add Reference', field: 'reference', type: 'text' },
                    { icon: '📋', label: 'Add Terms', field: 'terms', type: 'text' },
                ].map((opt, idx) => (
                    <div key={idx} className={styles.optionalRow}>
                        <div className={styles.optionalLabel}>
                            <span style={{ width: 24, textAlign: 'center' }}>{opt.icon}</span>
                            {opt.label}
                        </div>
                        <input
                            type={opt.type}
                            className={styles.optionalInput}
                            placeholder={opt.label}
                            value={details[opt.field]}
                            onChange={(e) => updateDetails(opt.field, e.target.value)}
                        />
                    </div>
                ))}
            </div>


            {/* Payments - Hide for Lending Bill */}
            {type !== 'LENDING' && (
                <>
                    <div className={styles.sectionTitle}>Payments</div>
                    <div className={styles.card}>
                        <div className={styles.checkboxRow}>
                            <input
                                type="checkbox"
                                checked={payment.isFullyPaid}
                                onChange={(e) => {
                                    updatePayment('isFullyPaid', e.target.checked);
                                    if (e.target.checked) updatePayment('amountReceived', totals.total);
                                }}
                                style={{ width: 18, height: 18 }}
                            />
                            <span style={{ fontWeight: 500 }}>Mark as fully paid</span>
                        </div>

                        <div className={styles.paymentGrid}>
                            <div>
                                <div className={styles.label}>Amount Received</div>
                                <div className={styles.inputWrapper}>
                                    <span style={{ color: '#6b7280' }}>₹</span>
                                    <input
                                        type="number"
                                        className={styles.paymentInput}
                                        value={payment.amountReceived}
                                        onChange={(e) => updatePayment('amountReceived', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className={styles.label}>Payment Mode</div>
                                <select
                                    className={styles.select}
                                    value={payment.mode}
                                    onChange={(e) => updatePayment('mode', e.target.value)}
                                >
                                    <option>Cash</option>
                                    <option>UPI</option>
                                    <option>Bank Transfer</option>
                                    <option>Cheque</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <div className={styles.label}>Notes</div>
                            <input
                                className={styles.input}
                                placeholder="Advance Received, UTR Number etc.,"
                                value={payment.notes}
                                onChange={(e) => updatePayment('notes', e.target.value)}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.footerLeft}>
                    {type === 'LENDING' ? (
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                            Total Items: {items.length} | Total Qty: {items.reduce((acc, i) => acc + (i.quantity || 0), 0)}
                        </div>
                    ) : (
                        <>
                            <div className={styles.footerRow}>
                                <span>Sub Total</span>
                                <span>{formatCurrency(totals.subtotal)}</span>
                            </div>

                            {/* Tax Breakdown (Only for Regular Invoices) */}
                            {type !== 'PROFORMA' && (
                                <>
                                    <div className={styles.footerRow} style={{ color: '#6b7280', fontSize: 12 }}>
                                        <span>CGST (1.5%)</span>
                                        <span>{formatCurrency(totals.cgst)}</span>
                                    </div>
                                    <div className={styles.footerRow} style={{ color: '#6b7280', fontSize: 12 }}>
                                        <span>SGST (1.5%)</span>
                                        <span>{formatCurrency(totals.sgst)}</span>
                                    </div>
                                </>
                            )}

                            <div className={styles.footerRow}>
                                <span>Round Off</span>
                                <div
                                    className={`${styles.toggleSwitch} ${roundOff ? styles.active : ''}`}
                                    onClick={toggleRoundOff}
                                    style={{ width: 36, height: 20 }}
                                >
                                    <div className={styles.toggleKnob} style={{ width: 16, height: 16 }} />
                                </div>
                                <span>{totals.roundOffAmount.toFixed(2)}</span>
                            </div>
                            <div className={styles.totalAmount}>
                                <span>Total Amount</span>
                                <span>{formatCurrency(totals.total)}</span>
                            </div>
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    {/* Save Status Indicator */}
                    {saveStatus === 'saved' && lastSavedAtFormatted && (
                        <div className={styles.saveIndicator}>
                            <FiCheck size={14} /> Saved at {lastSavedAtFormatted}
                        </div>
                    )}
                    {saveStatus === 'failed' && (
                        <div className={`${styles.saveIndicator} ${styles.saveIndicatorFailed}`}>
                            Save failed. Your changes are safe.
                        </div>
                    )}
                    {errors.items && <div className={styles.fieldError}>{errors.items}</div>}
                    <button
                        className={styles.createButton}
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? (
                            <><FiLoader style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                        ) : (
                            <>{id ? 'Update' : 'Create'} <FiArrowLeft style={{ transform: 'rotate(180deg)' }} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
