'use client';

import { useState } from 'react';
import { api } from '@/api/backendClient';
import styles from './page.module.css';

export default function CreateShopPage() {
    const [formData, setFormData] = useState({
        shopName: '',
        adminPhone: '',
        adminName: '',
        setupSecret: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [result, setResult] = useState(null);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.shopName.trim()) {
            setStatus('error');
            setMessage('Shop name is required');
            return;
        }
        if (!formData.adminPhone.trim() || formData.adminPhone.replace(/\D/g, '').length !== 10) {
            setStatus('error');
            setMessage('Please enter a valid 10-digit phone number');
            return;
        }
        if (!formData.setupSecret.trim()) {
            setStatus('error');
            setMessage('Setup secret is required');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await api.setup.bootstrap({
                shopName: formData.shopName.trim(),
                adminPhone: formData.adminPhone.replace(/\D/g, ''),
                setupSecret: formData.setupSecret
            });

            setStatus('success');
            setMessage('Shop created successfully!');
            setResult(response);
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to create shop. Please check your setup secret.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Create Shop</h1>
                <p className={styles.subtitle}>
                    Set up a new shop with an admin user.<br />
                    This is a one-time setup operation.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Shop Name *</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g., My Jewelry Store"
                            value={formData.shopName}
                            onChange={handleChange('shopName')}
                            disabled={status === 'loading' || status === 'success'}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Admin Phone Number *</label>
                        <input
                            type="tel"
                            className={styles.input}
                            placeholder="10-digit mobile number"
                            value={formData.adminPhone}
                            onChange={handleChange('adminPhone')}
                            maxLength={10}
                            disabled={status === 'loading' || status === 'success'}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Admin Name (optional)</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g., John Doe"
                            value={formData.adminName}
                            onChange={handleChange('adminName')}
                            disabled={status === 'loading' || status === 'success'}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Setup Secret *</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="Enter setup password"
                            value={formData.setupSecret}
                            onChange={handleChange('setupSecret')}
                            disabled={status === 'loading' || status === 'success'}
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={status === 'loading' || status === 'success'}
                    >
                        {status === 'loading' ? 'Creating...' : 'Create Shop'}
                    </button>
                </form>

                {message && (
                    <div className={`${styles.message} ${styles[status]}`}>
                        {message}
                    </div>
                )}

                {result && status === 'success' && (
                    <div className={styles.successDetails}>
                        <p><strong>Shop ID:</strong> {result.shop?.id}</p>
                        <p><strong>Shop Name:</strong> {result.shop?.name}</p>
                        <p><strong>Admin User ID:</strong> {result.user?.id}</p>
                        <p><strong>Admin Phone:</strong> {result.user?.phone}</p>
                        <p><strong>Role:</strong> {result.user?.role}</p>
                    </div>
                )}

                <a href="/" className={styles.backLink}>← Back to Home</a>
            </div>
        </div>
    );
}
