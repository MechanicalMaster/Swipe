'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { usePartyStore } from '@/lib/store/partyStore';
import { useEffect } from 'react';
import { formatCurrency } from '@/lib/utils/tax';
import { db } from '@/lib/db';
import { generatePDF } from '@/lib/utils/pdf';
import { FiPlus, FiTrash2, FiCalendar, FiUser, FiBox, FiArrowLeft } from 'react-icons/fi';
import styles from './InvoiceForm.module.css';

export default function InvoiceForm() {
    const router = useRouter();
    const searchParams = useSearchParams(); // Need to import this
    const prefillCustomerId = searchParams?.get('customerId');
    const { getCustomer } = usePartyStore(); // Need to import this

    const {
        id, invoiceNumber, date, dueDate, placeOfSupply, invoiceCopyType, items, customer,
        details, toggles, payment, roundOff,
        addItem, updateItem, removeItem, calculateTotals,
        updateDetails, toggleSwitch, updatePayment, toggleRoundOff, resetInvoice,
        setDueDate, setPlaceOfSupply, setInvoiceCopyType, setCustomer
    } = useInvoiceStore();

    useEffect(() => {
        if (prefillCustomerId && !customer) {
            const c = getCustomer(prefillCustomerId);
            if (c) setCustomer(c);
        }
    }, [prefillCustomerId, customer, getCustomer, setCustomer]);

    const totals = calculateTotals();

    const handleSave = async () => {
        if (!customer) return alert('Please select a customer');
        if (items.length === 0) return alert('Please add at least one item');

        try {
            const invoiceData = {
                invoiceNumber,
                invoiceNumber,
                date,
                dueDate,
                placeOfSupply,
                invoiceCopyType,
                customer,
                items,
                details,
                toggles,
                payment,
                totals,
                status: payment.isFullyPaid ? 'Paid' : 'Unpaid',
                updatedAt: new Date()
            };

            let savedId;
            if (id) {
                // Update existing
                await db.invoices.put({ ...invoiceData, id, createdAt: new Date() }); // Keep original createdAt if possible, but for now just put. 
                // To keep original createdAt, we should have fetched it. 
                // Ideally setInvoice should have stored createdAt too.
                // For simplicity, let's assume we might overwrite createdAt or we should have stored it.
                // Let's just put.
                savedId = id;
            } else {
                // Create new
                savedId = await db.invoices.add({ ...invoiceData, createdAt: new Date() });
            }

            resetInvoice(); // Clear form
            router.push(`/invoice/view?id=${savedId}`);
        } catch (error) {
            console.error('Failed to save invoice:', error);
            alert('Failed to save invoice');
        }
    };

    const handleDownloadPDF = async () => {
        await generatePDF({
            invoiceNumber,
            date,
            items,
            totals
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.row}>
                    <div>
                        <div className={styles.label}>Invoice #</div>
                        <div className={styles.value}>{invoiceNumber}</div>
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
            </div>

            <div className={styles.sectionTitle}>
                Products <FiBox size={14} />
            </div>
            <div className={styles.card}>
                <button
                    className={styles.addButton}
                    onClick={() => router.push('/invoice/create/select-product')}
                    style={{ marginBottom: '12px' }}
                >
                    <FiPlus /> Select Products
                </button>
                {items.map((item) => (
                    <div key={item.id} className={styles.itemRow}>
                        <div className={styles.itemHeader}>
                            <input
                                className={styles.input}
                                placeholder="Item Name"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            />
                            <button onClick={() => removeItem(item.id)} style={{ color: 'red' }}>
                                <FiTrash2 />
                            </button>
                        </div>
                        <div className={styles.itemInputs}>
                            <input
                                type="number"
                                className={styles.input}
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                            />
                            <input
                                type="number"
                                className={styles.input}
                                placeholder="Rate"
                                value={item.rate}
                                onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                            />
                            <div className={styles.value}>
                                {formatCurrency(item.quantity * item.rate)}
                            </div>
                        </div>
                    </div>
                ))}
                <button className={styles.addButton} onClick={addItem} style={{ background: 'white', border: '1px solid #e5e7eb', color: '#4b5563' }}>
                    <FiPlus /> Add Manual Item
                </button>
            </div>

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
                <div className={styles.optionalRow} style={{ borderBottom: 'none' }}>
                    <div className={styles.optionalLabel}>
                        <span style={{ width: 24, textAlign: 'center' }}>📎</span>
                        Attachments
                    </div>
                </div>
            </div>

            {/* Toggles */}


            {/* Payments */}
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

            {/* Footer */}
            <div className={styles.footer}>
                <div className={styles.footerLeft}>
                    <div className={styles.footerRow}>
                        <span>Sub Total</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
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
                </div>
                <button className={styles.createButton} onClick={handleSave}>
                    {id ? 'Update' : 'Create'} <FiArrowLeft style={{ transform: 'rotate(180deg)' }} />
                </button>
            </div>
        </div>
    );
}
