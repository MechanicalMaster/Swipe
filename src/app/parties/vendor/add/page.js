'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePartyStore } from '@/lib/store/partyStore';
import { FiArrowLeft, FiPlusCircle } from 'react-icons/fi';
import styles from '../../form.module.css';

export default function AddVendorPage() {
    const router = useRouter();
    const { addVendor } = usePartyStore();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        gstin: '',
        companyName: '',
        openingBalance: ''
    });

    const handleSave = async () => {
        if (!formData.name) return alert('Name is required');
        await addVendor(formData);
        router.push('/parties');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/parties"><FiArrowLeft size={24} /></Link>
                    Add Vendor
                </div>
            </div>

            <div className={styles.sectionLabel}>Basic Details</div>
            <div className={styles.card}>
                <input
                    className={styles.input}
                    placeholder="Name *"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    style={{ marginBottom: 12 }}
                />
                <div className={styles.row} style={{ marginBottom: 12 }}>
                    <div style={{ padding: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>🇮🇳 +91</div>
                    <input
                        className={styles.input}
                        placeholder="Enter Phone Number"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
                <input
                    className={styles.input}
                    placeholder="Email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            <div className={styles.sectionLabel}>Company Details (Optional)</div>
            <div className={styles.card}>
                <div className={styles.row} style={{ marginBottom: 12 }}>
                    <input
                        className={styles.input}
                        placeholder="GST Number"
                        value={formData.gstin}
                        onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    />
                    <button className={styles.fetchButton}>Fetch Details</button>
                </div>
                <input
                    className={styles.input}
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                />
            </div>

            <div className={styles.sectionLabel}>Other Details (Optional)</div>
            <div className={styles.card}>
                <div className={styles.actionRow} style={{ marginBottom: 12 }}>
                    <FiPlusCircle size={20} color="#6b7280" />
                    <span>Opening Balance</span>
                </div>
                <div className={styles.actionRow}>
                    <FiPlusCircle size={20} color="#6b7280" />
                    <span>Notes</span>
                </div>
            </div>

            <div className={styles.footer}>
                <button className={styles.saveButton} onClick={handleSave}>Add Vendor</button>
            </div>
        </div>
    );
}
