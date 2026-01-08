'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePartyStore } from '@/lib/store/partyStore';
import { useFormValidation } from '@/lib/hooks/formValidation';
import { vendorSchema } from '@/lib/validation/validationSchemas';
import { FiArrowLeft, FiPlusCircle, FiUpload, FiX, FiCheck } from 'react-icons/fi';
import styles from '../../form.module.css';

export default function AddVendorPage() {
    const router = useRouter();
    const { addVendor } = usePartyStore();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        gstin: '',
        companyName: '',
        documents: []
    });
    const [showBillingAddress, setShowBillingAddress] = useState(false);

    // Form validation hook
    const {
        saveStatus,
        lastSavedAtFormatted,
        errors,
        validate,
        markDraft,
        startSaving,
        markSaved,
        markFailed
    } = useFormValidation(vendorSchema);

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        markDraft(field);
    };

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
        markDraft();
    };

    const removeDocument = (index) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
        markDraft();
    };

    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');

    const handleSave = async () => {
        // Validate before submit
        const { success } = validate(formData);
        if (!success) return;

        // Double-submit prevention
        if (!startSaving()) return;

        try {
            const id = await addVendor({ ...formData, balance: 0 });
            markSaved();

            if (returnUrl) {
                router.push(returnUrl);
            } else {
                router.push('/parties');
            }
        } catch (error) {
            markFailed(error);
        }
    };

    const isSaving = saveStatus === 'saving';

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
                <div style={{ marginBottom: 12 }}>
                    <input
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        placeholder="Name *"
                        value={formData.name}
                        onChange={e => handleFieldChange('name', e.target.value)}
                    />
                    {errors.name && <div className={styles.fieldError}>{errors.name}</div>}
                </div>
                <div className={styles.row} style={{ marginBottom: 12 }}>
                    <div style={{ padding: 12, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>🇮🇳 +91</div>
                    <div style={{ flex: 1 }}>
                        <input
                            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                            placeholder="Enter Phone Number"
                            value={formData.phone}
                            onChange={e => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                handleFieldChange('phone', value);
                            }}
                        />
                        {errors.phone && <div className={styles.fieldError}>{errors.phone}</div>}
                    </div>
                </div>
                <div>
                    <input
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        placeholder="Email"
                        value={formData.email}
                        onChange={e => handleFieldChange('email', e.target.value)}
                    />
                    {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
                </div>
            </div>

            <div className={styles.sectionLabel}>Company Details (Optional)</div>
            <div className={styles.card}>
                <input
                    className={styles.input}
                    placeholder="GST Number"
                    value={formData.gstin}
                    onChange={e => handleFieldChange('gstin', e.target.value)}
                    style={{ marginBottom: 12 }}
                />
                <input
                    className={styles.input}
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={e => handleFieldChange('companyName', e.target.value)}
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
                        onChange={e => handleFieldChange('address', e.target.value)}
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
                {/* Save Status Indicator */}
                {saveStatus === 'saved' && lastSavedAtFormatted && (
                    <div className={styles.saveIndicator} style={{ marginBottom: 8 }}>
                        <FiCheck size={14} /> Saved at {lastSavedAtFormatted}
                    </div>
                )}
                {saveStatus === 'failed' && (
                    <div className={`${styles.saveIndicator} ${styles.saveIndicatorFailed}`} style={{ marginBottom: 8 }}>
                        Save failed. Your changes are safe.
                    </div>
                )}

                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : 'Add Vendor'}
                </button>
            </div>
        </div>
    );
}
