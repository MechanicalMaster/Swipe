'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePartyStore } from '@/lib/store/partyStore';
import { useInvoiceStore } from '@/lib/store/invoiceStore';
import { FiArrowLeft, FiPlusCircle, FiUpload, FiX } from 'react-icons/fi';
import styles from '../../form.module.css';

export default function AddCustomerPage() {
    const router = useRouter();
    const { addCustomer } = usePartyStore();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        documents: []
    });
    const [showBillingAddress, setShowBillingAddress] = useState(false);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    documents: [...prev.documents, {
                        name: file.name,
                        type: file.type,
                        data: reader.result
                    }]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    const { setCustomer } = useInvoiceStore();

    const handleSave = async () => {
        if (!formData.name) return alert('Name is required');
        const id = await addCustomer(formData);

        if (returnUrl) {
            // If returning to invoice, set the new customer as selected
            if (returnUrl.includes('invoice')) {
                setCustomer({ ...formData, id });
            }
            router.push(returnUrl);
        } else {
            router.push('/parties');
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

            <div className={styles.sectionLabel}>Billing Address (Optional)</div>
            <div className={styles.card}>
                {!showBillingAddress ? (
                    <div className={styles.actionRow} onClick={() => setShowBillingAddress(true)}>
                        <FiPlusCircle size={20} color="#6b7280" />
                        <span>Billing Address</span>
                    </div>
                ) : (
                    <textarea
                        className={styles.textarea}
                        placeholder="Enter Billing Address"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        autoFocus
                    />
                )}
            </div>

            <div className={styles.sectionLabel}>Documents (Optional)</div>
            <div className={styles.card}>
                <label className={styles.uploadBox}>
                    <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <FiUpload className={styles.uploadIcon} />
                    <span className={styles.uploadText}>Upload Identity Documents (Image/PDF)</span>
                </label>

                {formData.documents.length > 0 && (
                    <div className={styles.fileList}>
                        {formData.documents.map((doc, index) => (
                            <div key={index} className={styles.fileItem}>
                                <span>{doc.name}</span>
                                <FiX
                                    style={{ cursor: 'pointer', color: '#ef4444' }}
                                    onClick={() => removeDocument(index)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <button className={styles.saveButton} onClick={handleSave}>Add Customer</button>
            </div>
        </div>
    );
}
