'use client';

import { useState } from 'react';
import { api } from '@/api/backendClient';
import styles from './page.module.css';

export default function CreateUserPage() {
    const [formData, setFormData] = useState({
        phone: '',
        name: '',
        role: 'SALES'
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
        if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length !== 10) {
            setStatus('error');
            setMessage('Please enter a valid 10-digit phone number');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await api.auth.createUser({
                phone: formData.phone.replace(/\D/g, ''),
                name: formData.name.trim() || undefined,
                role: formData.role
            });

            setStatus('success');
            setMessage('User created successfully!');
            setResult(response);

            // Reset form for next user
            setFormData({
                phone: '',
                name: '',
                role: 'SALES'
            });
        } catch (error) {
            setStatus('error');
            if (error.status === 401) {
                setMessage('You must be logged in as an admin to create users');
            } else if (error.status === 403) {
                setMessage('You do not have permission to create users. Admin access required.');
            } else {
                setMessage(error.message || 'Failed to create user');
            }
        }
    };

    const handleCreateAnother = () => {
        setStatus('idle');
        setMessage('');
        setResult(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Create User</h1>
                <p className={styles.subtitle}>
                    Add a new user to your shop.<br />
                    You must be logged in as an admin.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Phone Number *</label>
                        <input
                            type="tel"
                            className={styles.input}
                            placeholder="10-digit mobile number"
                            value={formData.phone}
                            onChange={handleChange('phone')}
                            maxLength={10}
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Name (optional)</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g., Sales Person"
                            value={formData.name}
                            onChange={handleChange('name')}
                            disabled={status === 'loading'}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Role</label>
                        <select
                            className={styles.select}
                            value={formData.role}
                            onChange={handleChange('role')}
                            disabled={status === 'loading'}
                        >
                            <option value="SALES">SALES - Can create and update records</option>
                            <option value="ADMIN">ADMIN - Full access including delete and settings</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? 'Creating...' : 'Create User'}
                    </button>
                </form>

                {message && (
                    <div className={`${styles.message} ${styles[status]}`}>
                        {message}
                    </div>
                )}

                {result && status === 'success' && (
                    <>
                        <div className={styles.successDetails}>
                            <p><strong>User ID:</strong> {result.id}</p>
                            <p><strong>Phone:</strong> {result.phone}</p>
                            <p><strong>Name:</strong> {result.name || '(not set)'}</p>
                            <p><strong>Role:</strong> {result.role}</p>
                        </div>
                        <button
                            type="button"
                            className={styles.button}
                            onClick={handleCreateAnother}
                            style={{ marginTop: '12px' }}
                        >
                            Create Another User
                        </button>
                    </>
                )}

                <div className={styles.note}>
                    💡 Users can log in with their phone number after being created.
                </div>

                <a href="/" className={styles.backLink}>← Back to Home</a>
            </div>
        </div>
    );
}
