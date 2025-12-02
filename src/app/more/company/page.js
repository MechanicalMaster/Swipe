'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { FiArrowLeft, FiEdit2, FiPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { ImagePicker } from '@/components/ImagePicker';
import { AddressBottomSheet } from '@/components/AddressBottomSheet';
import styles from './page.module.css';

export default function CompanyDetailsPage() {
    const router = useRouter();
    const { companyDetails, updateCompanyDetails, loadSettings } = useSettingsStore();

    const [isBillingSheetOpen, setIsBillingSheetOpen] = useState(false);
    const [isShippingSheetOpen, setIsShippingSheetOpen] = useState(false);
    const [isOptionalExpanded, setIsOptionalExpanded] = useState(false);
    const [isGSTEnabled, setIsGSTEnabled] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (companyDetails.gstin) {
            setIsGSTEnabled(true);
        }
    }, [companyDetails.gstin]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone' || name === 'alternatePhone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            updateCompanyDetails({ [name]: numericValue });
        } else {
            updateCompanyDetails({ [name]: value });
        }
    };

    const handleImageSelect = (imageData) => {
        updateCompanyDetails({ logo: imageData });
    };

    const handleAddressSave = (type, addressData) => {
        if (type === 'billing') {
            updateCompanyDetails({ billingAddress: addressData });
        } else {
            updateCompanyDetails({ shippingAddress: addressData });
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                    <div className={styles.headerTitle}>Company Details</div>
                </div>
                <button className={styles.editButton}>
                    <FiEdit2 size={14} /> Edit
                </button>
            </div>

            <div className={styles.content}>
                {/* Main Card */}
                <div className={styles.card}>
                    <div className={styles.logoContainer}>
                        <ImagePicker image={companyDetails.logo} onImageSelect={handleImageSelect} />
                    </div>

                    <div style={{ marginTop: '40px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Business/Company Name</label>
                            <input
                                name="name"
                                value={companyDetails.name || ''}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="Enter Business Name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <input
                                    type="checkbox"
                                    checked={isGSTEnabled}
                                    onChange={(e) => setIsGSTEnabled(e.target.checked)}
                                    style={{ width: 16, height: 16 }}
                                />
                                <label className={styles.label} style={{ margin: 0 }}>GST Number (Optional)</label>
                            </div>
                            {isGSTEnabled && (
                                <input
                                    name="gstin"
                                    value={companyDetails.gstin || ''}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="Enter GSTIN"
                                />
                            )}
                            {!isGSTEnabled && <div className={styles.value}>NA</div>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Business Phone No.</label>
                            <input
                                name="phone"
                                value={companyDetails.phone || ''}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="Enter Phone Number"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Business Email</label>
                            <input
                                name="email"
                                value={companyDetails.email || ''}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="Enter Email"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Trade/Brand Name</label>
                            <input
                                name="tradeName"
                                value={companyDetails.tradeName || companyDetails.name || ''}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="Enter Trade Name"
                            />
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div>
                    <div style={{ fontWeight: 600, marginBottom: '12px' }}>Billing Address</div>
                    <button className={styles.addressButton} onClick={() => setIsBillingSheetOpen(true)}>
                        <div className={styles.iconCircle}><FiPlus size={16} /></div>
                        {companyDetails.billingAddress?.addressLine1 ? 'Edit Billing Address' : 'Billing Address'}
                    </button>
                    {companyDetails.billingAddress?.addressLine1 && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666', paddingLeft: '12px' }}>
                            {companyDetails.billingAddress.addressLine1}, {companyDetails.billingAddress.city}
                        </div>
                    )}
                </div>

                <div>
                    <div style={{ fontWeight: 600, marginBottom: '12px' }}>Shipping Address</div>
                    <button className={styles.addressButton} onClick={() => setIsShippingSheetOpen(true)}>
                        <div className={styles.iconCircle}><FiPlus size={16} /></div>
                        {companyDetails.shippingAddress?.addressLine1 ? 'Edit Shipping Address' : 'Shipping Address'}
                    </button>
                    {companyDetails.shippingAddress?.addressLine1 && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#666', paddingLeft: '12px' }}>
                            {companyDetails.shippingAddress.addressLine1}, {companyDetails.shippingAddress.city}
                        </div>
                    )}
                </div>

                {/* Optional Fields */}
                <div>
                    <div className={styles.accordionHeader} onClick={() => setIsOptionalExpanded(!isOptionalExpanded)}>
                        <div>
                            <div>Optional Fields</div>
                            <div style={{ fontSize: '12px', color: '#666', fontWeight: 400 }}>Pan Number, Alternate Contact Number, Website</div>
                        </div>
                        {isOptionalExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </div>

                    {isOptionalExpanded && (
                        <div className={styles.accordionContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>PAN Number</label>
                                <input
                                    name="panNumber"
                                    value={companyDetails.panNumber || ''}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="Enter PAN"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Alternate Contact Number</label>
                                <input
                                    name="alternatePhone"
                                    value={companyDetails.alternatePhone || ''}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="Enter Alternate Number"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Website</label>
                                <input
                                    name="website"
                                    value={companyDetails.website || ''}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="Enter Website"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AddressBottomSheet
                isOpen={isBillingSheetOpen}
                onClose={() => setIsBillingSheetOpen(false)}
                onSave={(data) => handleAddressSave('billing', data)}
                initialData={companyDetails.billingAddress}
                title="Enter Billing Address"
            />

            <AddressBottomSheet
                isOpen={isShippingSheetOpen}
                onClose={() => setIsShippingSheetOpen(false)}
                onSave={(data) => handleAddressSave('shipping', data)}
                initialData={companyDetails.shippingAddress}
                title="Enter Shipping Address"
                showAutofill={true}
            />
        </div>
    );
}
