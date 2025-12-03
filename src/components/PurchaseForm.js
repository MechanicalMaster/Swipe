'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePurchaseStore } from '@/lib/store/purchaseStore';
import { formatCurrency } from '@/lib/utils/tax';
import { db } from '@/lib/db';
import { FiPlus, FiTrash2, FiUser, FiBox, FiArrowLeft } from 'react-icons/fi';
import styles from '@/components/InvoiceForm.module.css'; // Reuse invoice styles

export default function PurchaseForm() {
    const router = useRouter();
    const {
        purchaseNumber, date, items,
        addItem, updateItem, removeItem, calculateTotals, resetStore
    } = usePurchaseStore();

    useEffect(() => {
        resetStore();
    }, []);

    const totals = calculateTotals();

    const handleSave = async () => {
        try {
            await db.purchases.add({
                purchaseNumber,
                date,
                items,
                totals,
                status: 'Unpaid',
                balanceDue: totals.total,
                createdAt: new Date()
            });
            alert('Purchase saved successfully!');
            router.push('/bills');
        } catch (error) {
            console.error('Failed to save purchase:', error);
            alert('Failed to save purchase');
        }
    };

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>Create Purchase</h2>
            </div>

            <div className={styles.card}>
                <div className={styles.row}>
                    <div>
                        <div className={styles.label}>Purchase #</div>
                        <div className={styles.value}>{purchaseNumber}</div>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.label}>{date}</div>
                </div>
            </div>

            <div className={styles.sectionTitle}>
                Vendor <FiUser size={14} />
            </div>
            <div className={styles.card}>
                <button className={styles.addButton}>
                    <FiPlus /> Select Vendor
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
                <button className={styles.saveButton} onClick={handleSave}>Save Purchase</button>
            </div>
        </div>
    );
}
