'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePartyStore } from '@/lib/store/partyStore';
import { FiArrowLeft, FiMoreHorizontal, FiPlayCircle, FiPlusCircle, FiCopy, FiChevronDown } from 'react-icons/fi';
import { AddressBottomSheet } from '@/components/AddressBottomSheet';
import AnimatedButton from '@/components/AnimatedButton';
import styles from './page.module.css';

function VendorEditContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { getVendor, updateVendor } = usePartyStore();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        gstin: '',
        companyName: '',
        billingAddress: null,
        shippingAddress: null,
        sameAsBilling: false
    });

    const [isBillingSheetOpen, setIsBillingSheetOpen] = useState(false);
    const [isShippingSheetOpen, setIsShippingSheetOpen] = useState(false);

    useEffect(() => {
        if (id) {
            const vendor = getVendor(id);
            if (vendor) {
                setFormData(prev => ({ ...prev, ...vendor }));
            }
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert('Name is required');
            return;
        }
        if (formData.phone && formData.phone.length !== 10) {
            alert('Phone number must be 10 digits');
            return;
        }
        await updateVendor(parseInt(id), formData);
        router.back();
    };

    const handleAddressSave = (type, addressData) => {
        if (type === 'billing') {
            setFormData(prev => ({
                ...prev,
                billingAddress: addressData,
                shippingAddress: prev.sameAsBilling ? addressData : prev.shippingAddress
            }));
        } else {
            setFormData(prev => ({ ...prev, shippingAddress: addressData }));
        }
    };

    const toggleSameAsBilling = () => {
        setFormData(prev => {
            const newSame = !prev.sameAsBilling;
            return {
                ...prev,
                sameAsBilling: newSame,
                shippingAddress: newSame ? prev.billingAddress : prev.shippingAddress
            };
        });
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                    <span className={styles.headerTitle}>Update Vendor</span>
                </div>
                <div className={styles.headerActions}>
                    <div className={styles.importAction}>
                        Import <FiChevronDown />
                    </div>
                    <FiMoreHorizontal size={24} />
                </div>
            </div>

            <div className={styles.content}>
                {/* Basic Details */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitle}>Basic Details</div>
                        <FiPlayCircle size={20} color="#dc2626" />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            className={styles.input}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder=" "
                        />
                        <label className={styles.label}>Name <span style={{ color: 'red' }}>*</span></label>
                    </div>

                    <div className={styles.phoneInputContainer} style={{ marginBottom: '16px' }}>
                        <img src="https://flagcdn.com/w40/in.png" alt="IN" className={styles.flag} />
                        <span className={styles.phonePrefix}>IN +91 <FiChevronDown size={12} /></span>
                        <input
                            className={styles.phoneInput}
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter Phone Number"
                        />
                    </div>

                    <div className={styles.inputGroup} style={{ marginBottom: 0 }}>
                        <input
                            className={styles.input}
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder=" "
                        />
                        <label className={styles.label}>Email</label>
                    </div>
                </div>

                {/* Company Details */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle} style={{ marginBottom: '16px' }}>Company Details (Optional)</div>

                    <div style={{ marginBottom: '16px' }}>
                        <div className={styles.gstContainer}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    className={styles.gstInput}
                                    name="gstin"
                                    value={formData.gstin || ''}
                                    onChange={handleChange}
                                    placeholder="GST Number"
                                    style={{ paddingTop: '20px', paddingBottom: '4px' }}
                                />
                                <label style={{ position: 'absolute', left: '12px', top: '4px', fontSize: '10px', color: '#6b7280' }}>GST Number</label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className={styles.inputGroup} style={{ marginBottom: '4px' }}>
                            <input
                                className={styles.input}
                                name="companyName"
                                value={formData.companyName || ''}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label className={styles.label}>Company Name</label>
                        </div>
                        <div className={styles.helperText}>eg. Tata Motors Private Limited</div>
                    </div>
                </div>

                {/* Billing Address */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle} style={{ marginBottom: '16px' }}>Billing Address (Optional)</div>
                    <button className={styles.addressButton} onClick={() => setIsBillingSheetOpen(true)}>
                        <FiPlusCircle size={18} /> {formData.billingAddress ? 'Edit Billing Address' : 'Billing Address'}
                    </button>
                </div>

                {/* Shipping Address */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitle}>Shipping Address (Optional)</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px' }}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#6b7280', cursor: 'pointer', flex: 1 }}
                            onClick={() => setIsShippingSheetOpen(true)}
                        >
                            <FiPlusCircle size={18} /> {formData.shippingAddress ? 'Edit Shipping Address' : 'Shipping Address'}
                        </div>
                        <div className={styles.checkboxContainer} onClick={toggleSameAsBilling}>
                            <span>Same as Billing?</span>
                            <FiCopy size={16} color={formData.sameAsBilling ? '#2563eb' : '#9ca3af'} />
                        </div>
                    </div>
                </div>

                <AnimatedButton className={styles.updateButton} onClick={handleSave}>
                    Update Vendor
                </AnimatedButton>
            </div>

            <AddressBottomSheet
                isOpen={isBillingSheetOpen}
                onClose={() => setIsBillingSheetOpen(false)}
                onSave={(data) => handleAddressSave('billing', data)}
                initialData={formData.billingAddress}
                title="Enter Billing Address"
            />

            <AddressBottomSheet
                isOpen={isShippingSheetOpen}
                onClose={() => setIsShippingSheetOpen(false)}
                onSave={(data) => handleAddressSave('shipping', data)}
                initialData={formData.shippingAddress}
                title="Enter Shipping Address"
            />
        </div>
    );
}

export default function VendorEditPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VendorEditContent />
        </Suspense>
    );
}
