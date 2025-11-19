'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePartyStore } from '@/lib/store/partyStore';
import { FiArrowLeft, FiPlusCircle, FiChevronDown } from 'react-icons/fi';
import styles from '../../form.module.css';

export default function AddCustomerPage() {
    const router = useRouter();
    const { addCustomer } = usePartyStore();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        gstin: '',
        companyName: '',
        address: ''
    });

    const handleSave = async () => {
        if (!formData.name) return alert('Name is required');
        await addCustomer(formData);
        router.push('/parties');
    };

    const fetchGST = () => {
        if (formData.gstin === '22AAAAA0000A1Z5') {
            setFormData(prev => ({ ...prev, companyName: 'Tata Motors Private Limited' }));
        } else {
            alert('Mock Fetch: Use "22AAAAA0000A1Z5" to test');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href="/parties"><FiArrowLeft size={24} /></Link>
                    Add Customer
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
                    <button className={styles.fetchButton} onClick={fetchGST}>Fetch Details</button>
                </div>
                <input
                    className={styles.input}
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                />
            </div>

            <div className={styles.sectionLabel}>Billing Address (Optional)</div>
            <div className={styles.card}>
                <div className={styles.actionRow}>
                    <FiPlusCircle size={20} color="#6b7280" />
                    <span>Billing Address</span>
                </div>
            </div>

            <div className={styles.footer}>
                <button className={styles.saveButton} onClick={handleSave}>Add Customer</button>
            </div>
        </div>
    );
}
