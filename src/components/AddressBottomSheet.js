import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import styles from './BottomSheet.module.css'; // Reusing existing BottomSheet styles

export const AddressBottomSheet = ({ isOpen, onClose, onSave, initialData, title, showAutofill }) => {
    const [formData, setFormData] = useState({
        addressLine1: '',
        addressLine2: '',
        pincode: '',
        city: '',
        state: ''
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(initialData);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!formData.addressLine1 || !formData.state) {
            alert('Please fill required fields (*)');
            return;
        }
        onSave(formData);
        onClose();
    };

    // Mock fetch details
    const fetchDetails = () => {
        if (formData.pincode === '500032') {
            setFormData(prev => ({ ...prev, city: 'Hyderabad', state: 'Telangana' }));
        } else {
            alert('Details not found for this pincode (Try 500032)');
        }
    };

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                <div className={styles.handleBar} />

                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>
                    <FiX size={24} onClick={onClose} style={{ cursor: 'pointer' }} />
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto' }}>
                    {showAutofill && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontSize: '14px', fontWeight: 500 }}>
                            <input type="checkbox" /> Autofill Company Name
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Address Line 1 <span style={{ color: 'red' }}>*</span></label>
                        <input
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Address Line 2</label>
                        <input
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>Pincode</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px' }}
                                />
                                <button
                                    onClick={fetchDetails}
                                    style={{ position: 'absolute', right: '4px', top: '4px', bottom: '4px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '0 12px', fontSize: '12px', cursor: 'pointer' }}
                                >
                                    Fetch Details
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>City</label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>State <span style={{ color: 'red' }}>*</span></label>
                            <input
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px' }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        style={{ width: '100%', background: '#2563eb', color: 'white', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 'bold', marginTop: '16px' }}
                    >
                        Save & Update
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
