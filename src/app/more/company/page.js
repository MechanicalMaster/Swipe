'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { FiArrowLeft, FiPlusCircle, FiImage, FiChevronDown } from 'react-icons/fi';
import styles from './page.module.css';

export default function CompanyDetailsPage() {
    const router = useRouter();
    const { companyDetails, loadSettings, updateCompanyDetails } = useSettingsStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...companyDetails });

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        setFormData(companyDetails);
    }, [companyDetails]);

    const handleSave = async () => {
        await updateCompanyDetails(formData);
        setIsEditing(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <Link href="/more"><FiArrowLeft size={24} /></Link>
                    Company Details
                </div>
                <button className={styles.editButton} onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel' : 'Edit'}
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.logoSection}>
                    <div className={styles.logoBox}>
                        <FiImage />
                        {isEditing && (
                            <div style={{ position: 'absolute', bottom: -5, right: -5, background: 'var(--primary)', color: 'white', borderRadius: '50%', padding: 4 }}>
                                <FiPlusCircle size={12} />
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <div className={styles.label}>Business/Company Name</div>
                    {isEditing ? (
                        <input
                            className={styles.input}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter Company Name"
                        />
                    ) : (
                        <div className={styles.value}>{formData.name || 'Sethiyagold'}</div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <div className={styles.label}>GST Number</div>
                    {isEditing ? (
                        <input
                            className={styles.input}
                            value={formData.gstin}
                            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                            placeholder="Enter GSTIN"
                        />
                    ) : (
                        <div className={styles.value}>{formData.gstin || 'NA'}</div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <div className={styles.label}>Business Phone No.</div>
                    {isEditing ? (
                        <input
                            className={styles.input}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter Phone"
                        />
                    ) : (
                        <div className={styles.value}>{formData.phone || '8454881721'}</div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <div className={styles.label}>Business Email</div>
                    {isEditing ? (
                        <input
                            className={styles.input}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter Email"
                        />
                    ) : (
                        <div className={styles.value}>{formData.email || '-'}</div>
                    )}
                </div>
            </div>

            <div className={styles.sectionLabel}>Billing Address</div>
            <div className={styles.actionRow}>
                <FiPlusCircle size={20} color="#6b7280" />
                <span>Billing Address</span>
            </div>

            <div className={styles.sectionLabel}>Shipping Address</div>
            <div className={styles.actionRow}>
                <FiPlusCircle size={20} color="#6b7280" />
                <span>Shipping Address</span>
            </div>

            <div className={styles.sectionLabel} style={{ display: 'flex', justifyContent: 'space-between' }}>
                Optional Fields <FiChevronDown />
            </div>

            {isEditing && (
                <button className={styles.saveButton} onClick={handleSave}>
                    Save Details
                </button>
            )}
        </div>
    );
}
