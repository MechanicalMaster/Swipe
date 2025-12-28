'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import styles from './LoginFlow.module.css';
import LandingPage from '../LandingPage/LandingPage';

export default function LoginFlow() {
    const {
        currentStep,
        setStep,
        phoneNumber,
        requestOTP,
        verifyOTP,
        isLoading,
        isNotAssignedToShop,
        error: storeError
    } = useAuthStore();
    const [phone, setPhone] = useState(phoneNumber || '');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');

    const handlePhoneSubmit = async () => {
        console.log('[LoginFlow] handlePhoneSubmit clicked');
        console.log('[LoginFlow] raw phone:', phone);

        const normalizedPhone = phone.replace(/\D/g, '');
        console.log('[LoginFlow] normalized phone:', normalizedPhone);

        if (normalizedPhone.length !== 10) {
            console.log('[LoginFlow] validation failed');
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setError('');
        console.log('[LoginFlow] calling requestOTP');
        const success = await requestOTP(normalizedPhone);
        console.log('[LoginFlow] requestOTP returned:', success);
        if (!success) {
            setError('Failed to send OTP. Please try again.');
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpSubmit = async () => {
        const otpValue = otp.join('');
        const success = await verifyOTP(otpValue);
        if (!success) {
            setError('Invalid OTP. Please use 111111');
        }
    };

    if (currentStep === 'welcome') {
        return <LandingPage onGetStarted={() => setStep('phone')} />;
    }

    console.log('[LoginFlow] render - isLoading:', isLoading, 'currentStep:', currentStep);

    if (currentStep === 'phone') {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.title}>Enter Phone Number</h2>
                    <p className={styles.subtitle}>We'll send you an OTP</p>
                    <input
                        className={styles.input}
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                    />
                    {error && <div className={styles.error}>{error}</div>}
                    <button className={styles.button} onClick={handlePhoneSubmit} disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                    <button className={styles.backButton} onClick={() => setStep('welcome')}>
                        Back
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 'otp') {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.title}>Enter OTP</h2>
                    <p className={styles.subtitle}>Sent to {phoneNumber}</p>
                    <div className={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                className={styles.otpInput}
                                type="tel"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                            />
                        ))}
                    </div>
                    {error && <div className={styles.error}>{error}</div>}
                    <button className={styles.button} onClick={handleOtpSubmit} disabled={otp.join('').length !== 6}>
                        Verify OTP
                    </button>
                    <button className={styles.backButton} onClick={() => setStep('phone')}>
                        Change Number
                    </button>
                </div>
            </div>
        );
    }
    // Blocking message for users not assigned to any shop
    if (currentStep === 'notAssigned' || isNotAssignedToShop) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.title}>Access Denied</h2>
                    <p className={styles.subtitle}>
                        You are not added to any shop.<br />
                        Please contact your administrator.
                    </p>
                    <div className={styles.error}>
                        {storeError || 'Your phone number is not registered with any shop.'}
                    </div>
                    <button
                        className={styles.backButton}
                        onClick={() => setStep('phone')}
                        style={{ marginTop: '16px' }}
                    >
                        Try Another Number
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
