'use client';

import { useRouter } from 'next/navigation';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { formatCurrency } from '@/lib/utils/tax';
import { db } from '@/lib/db';
import { generatePDF } from '@/lib/utils/pdf';
import { FiPlus, FiTrash2, FiCalendar, FiUser, FiBox } from 'react-icons/fi';
import styles from './InvoiceForm.module.css';

export default function InvoiceForm() {
    const router = useRouter();
    const {
        invoiceNumber, date, items,
        addItem, updateItem, removeItem, calculateTotals
    } = useInvoiceStore();

    const totals = calculateTotals();

    const handleSave = async () => {
        try {
            const id = await db.invoices.add({
                invoiceNumber,
                date,
                items,
                totals,
                status: 'Unpaid',
                createdAt: new Date()
            });
            alert('Invoice saved successfully!');
            router.push('/'); // Redirect to home
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
                    <div className={styles.label}>{date}</div>
                </div>
            </div>

            <div className={styles.sectionTitle}>
                Customer <FiUser size={14} />
            </div>
            <div className={styles.card}>
                <button className={styles.addButton}>
                    <FiPlus /> Select Customer
                </button>
            </div>

            <div className={styles.sectionTitle}>
                Products <FiBox size={14} />
            </div>
            <div className={styles.card}>
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
                <button className={styles.addButton} onClick={addItem}>
                    <FiPlus /> Add Product
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.totalSection}>
                    <div className={styles.totalRow}>
                        <span>Subtotal</span>
                        <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className={styles.totalRow}>
                        <span>Tax (18%)</span>
                        <span>{formatCurrency(totals.totalTax)}</span>
                    </div>
                    <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                        <span>Total</span>
                        <span>{formatCurrency(totals.total)}</span>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <button className={styles.saveButton} onClick={handleSave}>Save Invoice</button>
                <button
                    className={styles.saveButton}
                    style={{ background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                    onClick={handleDownloadPDF}
                >
                    PDF
                </button>
            </div>
        </div>
    );
}
