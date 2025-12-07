'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { usePurchaseStore } from '@/lib/store/purchaseStore';
import { usePartyStore } from '@/lib/store/partyStore';
import { useEffect } from 'react';
import { formatCurrency } from '@/lib/utils/tax';
import { FiPlus, FiTrash2, FiCopy, FiCalendar, FiUser, FiBox, FiArrowLeft } from 'react-icons/fi';
import styles from './PurchaseForm.module.css';

export default function PurchaseForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const prefillVendorId = searchParams?.get('vendorId');
    const { getVendor } = usePartyStore();

    const {
        id, purchaseNumber, date, dueDate, items, vendor,
        details, payment, roundOff, gstEnabled,
        addItem, updateItem, removeItem, duplicateItem, calculateTotals,
        updateDetails, updatePayment, toggleRoundOff, toggleGst,
        resetPurchase, savePurchase, setVendor, setDate, setDueDate
    } = usePurchaseStore();

    useEffect(() => {
        if (prefillVendorId && !vendor) {
            const v = getVendor(prefillVendorId);
            if (v) setVendor(v);
        }
    }, [prefillVendorId, vendor, getVendor, setVendor]);

    const totals = calculateTotals();

    const handleSave = async () => {
        if (!vendor) return alert('Please select a vendor');
        if (items.length === 0) return alert('Please add at least one item');

        try {
            const savedId = await savePurchase();
            resetPurchase();
            router.push(`/parties/vendor/view?id=${vendor.id}`);
        } catch (error) {
            console.error('Failed to save purchase:', error);
            alert('Failed to save purchase: ' + error.message);
        }
    };

    // Calculate item amount
    const getItemAmount = (item) => {
        const netWeight = Number(item.netWeight) || 0;
        const wastage = Number(item.wastage) || 0;
        const effectiveWeight = netWeight + wastage;
        const ratePerGram = Number(item.ratePerGram) || 0;
        return effectiveWeight * ratePerGram * (item.quantity || 1);
    };

    return (
        <div className={styles.container}>
            {/* Purchase Details Card */}
            <div className={styles.card}>
                <div className={styles.row}>
                    <div>
                        <div className={styles.label}>Purchase #</div>
                        <div className={styles.value}>{purchaseNumber}</div>
                    </div>
                    <div className={styles.value} style={{ color: '#f59e0b' }}>Edit</div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Date</div>
                    <input
                        type="date"
                        className={styles.input}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>Due Date</div>
                    <input
                        type="date"
                        className={styles.input}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Vendor Selection */}
            <div className={styles.sectionTitle}>
                Vendor <FiUser size={14} />
            </div>
            <div className={styles.card}>
                {vendor ? (
                    <div className={styles.selectedVendor}>
                        <div className={styles.vendorInfo}>
                            <div className={styles.vendorName}>{vendor.name}</div>
                            {vendor.phone && <div className={styles.vendorPhone}>{vendor.phone}</div>}
                        </div>
                        <div className={styles.vendorActions}>
                            <button
                                className={styles.actionButton}
                                onClick={() => router.push('/purchase/create/select-vendor')}
                            >
                                Change
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        className={styles.addButton}
                        onClick={() => router.push('/purchase/create/select-vendor')}
                    >
                        <FiPlus /> Select Vendor
                    </button>
                )}
            </div>

            {/* Items Section */}
            <div className={styles.sectionTitle}>
                Items <FiBox size={14} />
            </div>
            <div className={styles.card}>
                {items.map((item) => (
                    <div key={item.id} className={styles.itemRow}>
                        <div className={styles.itemHeader} style={{ marginBottom: 8, justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <label style={{ fontSize: 10, color: '#6b7280', display: 'block', marginBottom: 4 }}>Item Name / Description</label>
                                    <input
                                        className={styles.input}
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        placeholder="Enter Item Description"
                                    />
                                </div>
                            </div>
                            <div className={styles.itemActions}>
                                <button
                                    className={styles.itemActionBtn}
                                    onClick={() => duplicateItem(item.id)}
                                    title="Duplicate"
                                >
                                    <FiCopy size={16} />
                                </button>
                                <button
                                    className={`${styles.itemActionBtn} ${styles.delete}`}
                                    onClick={() => removeItem(item.id)}
                                    title="Delete"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Row 1: Weight Fields */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 10, color: '#6b7280' }}>Net Weight (g)</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    value={item.netWeight || ''}
                                    onChange={(e) => updateItem(item.id, 'netWeight', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 10, color: '#6b7280' }}>Gross Weight (g)</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    value={item.grossWeight || ''}
                                    onChange={(e) => updateItem(item.id, 'grossWeight', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 10, color: '#6b7280' }}>Wastage (g)</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    value={item.wastage || ''}
                                    onChange={(e) => updateItem(item.id, 'wastage', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Row 2: Rate */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 10, color: '#6b7280' }}>Rate per gram (₹)</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    value={item.ratePerGram || ''}
                                    onChange={(e) => updateItem(item.id, 'ratePerGram', e.target.value)}
                                    placeholder="Rate"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 10, color: '#6b7280' }}>Quantity</label>
                                <input
                                    className={styles.input}
                                    type="number"
                                    value={item.quantity || 1}
                                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                    placeholder="1"
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* Row 3: Calculated Amount */}
                        <div style={{ display: 'flex', gap: 8, background: '#fef9c3', padding: 8, borderRadius: 6 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 10, color: '#6b7280' }}>Eff. Weight</div>
                                <div style={{ fontSize: 12, fontWeight: 500 }}>
                                    {((Number(item.netWeight) || 0) + (Number(item.wastage) || 0)).toFixed(2)}g
                                </div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'right' }}>
                                <div style={{ fontSize: 10, color: '#6b7280' }}>Amount</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#d97706' }}>
                                    {formatCurrency(getItemAmount(item))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    className={styles.addButton}
                    onClick={() => addItem()}
                    style={{ background: 'white', border: '1px solid #e5e7eb', color: '#4b5563' }}
                >
                    <FiPlus /> Add Item Row
                </button>
            </div>

            {/* GST Toggle */}
            <div className={styles.sectionTitle}>Tax Settings</div>
            <div className={styles.card}>
                <div className={styles.toggleRow}>
                    <div className={styles.toggleLabel}>Enable GST</div>
                    <div
                        className={`${styles.toggleSwitch} ${gstEnabled ? styles.active : ''}`}
                        onClick={toggleGst}
                    >
                        <div className={styles.toggleKnob} />
                    </div>
                </div>
                {gstEnabled && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                        CGST (1.5%) + SGST (1.5%) will be applied
                    </div>
                )}
            </div>

            {/* Optional Fields */}
            <div className={styles.sectionTitle}>Optional</div>
            <div className={styles.card} style={{ padding: 0 }}>
                {[
                    { icon: '📄', label: 'Add Reference', field: 'reference', type: 'text' },
                    { icon: '📝', label: 'Add Notes', field: 'notes', type: 'text' },
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
                <div className={styles.optionalRow} style={{ borderBottom: 'none' }}>
                    <div className={styles.optionalLabel}>
                        <span style={{ width: 24, textAlign: 'center' }}>📎</span>
                        Attachments
                    </div>
                </div>
            </div>

            {/* Payments */}
            <div className={styles.sectionTitle}>Payments</div>
            <div className={styles.card}>
                <div className={styles.checkboxRow}>
                    <input
                        type="checkbox"
                        checked={payment.isFullyPaid}
                        onChange={(e) => {
                            updatePayment('isFullyPaid', e.target.checked);
                            if (e.target.checked) updatePayment('amountPaid', totals.total);
                        }}
                        style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontWeight: 500 }}>Mark as fully paid</span>
                </div>

                <div className={styles.paymentGrid}>
                    <div>
                        <div className={styles.label}>Amount Paid</div>
                        <div className={styles.inputWrapper}>
                            <span style={{ color: '#6b7280' }}>₹</span>
                            <input
                                type="number"
                                className={styles.paymentInput}
                                value={payment.amountPaid}
                                onChange={(e) => updatePayment('amountPaid', e.target.value)}
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
                        placeholder="Payment notes..."
                        value={payment.notes}
                        onChange={(e) => updatePayment('notes', e.target.value)}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.footerLeft}>
                    <div className={styles.footerRow}>
                        <span>Sub Total</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>

                    {gstEnabled && (
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
                        <span style={{ marginLeft: 16 }}>{formatCurrency(totals.total)}</span>
                    </div>
                </div>
                <button className={styles.createButton} onClick={handleSave}>
                    {id ? 'Update' : 'Create'} <FiArrowLeft style={{ transform: 'rotate(180deg)' }} />
                </button>
            </div>
        </div>
    );
}
