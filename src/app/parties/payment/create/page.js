'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePartyStore } from '@/lib/store/partyStore';
import { FiArrowLeft, FiPlayCircle, FiCalendar, FiPlus, FiCamera, FiUpload } from 'react-icons/fi';
import AnimatedButton from '@/components/AnimatedButton';
import styles from './page.module.css';

function RecordPaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const customerId = searchParams.get('customerId');
    const vendorId = searchParams.get('vendorId');
    const partyType = searchParams.get('partyType') || 'customer'; // 'customer' or 'vendor'
    const mode = searchParams.get('mode') || 'in'; // 'in' (You Got) or 'out' (You Gave)
    const { getCustomer, addPayment, getVendor, addVendorPayment } = usePartyStore();

    const isVendor = partyType === 'vendor';
    const partyId = isVendor ? vendorId : customerId;

    const [party, setParty] = useState(null);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentType, setPaymentType] = useState('Cash');
    const [notes, setNotes] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [sendSms, setSendSms] = useState(false);
    const [sendEmail, setSendEmail] = useState(false);

    useEffect(() => {
        if (partyId) {
            const p = isVendor ? getVendor(partyId) : getCustomer(partyId);
            if (p) setParty(p);
        }
    }, [partyId, isVendor]);

    const handleRecord = async () => {
        if (!amount) {
            alert('Please enter an amount');
            return;
        }

        if (isVendor) {
            const paymentData = {
                vendorId: vendorId,  // UUID from backend, don't parseInt
                amount: parseFloat(amount),
                date,
                type: paymentType,
                notes,
                internalNotes,
                sendSms,
                sendEmail,
                timestamp: Date.now(),
                mode: mode
            };
            await addVendorPayment(paymentData);
        } else {
            const paymentData = {
                customerId: customerId,  // UUID from backend, don't parseInt
                amount: parseFloat(amount),
                date,
                type: paymentType,
                notes,
                internalNotes,
                sendSms,
                sendEmail,
                timestamp: Date.now(),
                mode: mode
            };
            await addPayment(paymentData);
        }
        router.back();
    };

    const paymentTypes = ['UPI', 'Cash', 'Card', 'Net Banking', 'Cheque', 'EMI', 'TDS'];

    if (!party) return <div>Loading...</div>;

    const isIn = mode === 'in';
    const themeColor = isIn ? '#16a34a' : '#2563eb'; // Green : Blue
    const themeBg = isIn ? '#dcfce7' : '#dbeafe'; // Light Green : Light Blue
    const themeText = isIn ? '#166534' : '#1e40af'; // Dark Green : Dark Blue

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiArrowLeft size={24} onClick={() => router.back()} style={{ cursor: 'pointer' }} />
                    <div>
                        <div className={styles.headerTitle}>Record Payment</div>
                        <div className={styles.headerSubtitle}>{isVendor ? 'Vendor' : 'Customer'}: {party.name}</div>
                    </div>
                </div>
                <FiPlayCircle size={24} color="#ef4444" />
            </div>

            <div className={styles.content}>
                <div className={styles.sectionTitle}>Payment</div>
                <div className={styles.sectionTitleBold}>Details</div>

                {/* Amount Input */}
                <div className={styles.inputGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label className={styles.label}>
                            {isIn ? 'Amount to be Recorded (₹)' : 'Amount to be paid (₹)'}
                        </label>
                        <span className={styles.resetLink} onClick={() => setAmount('')}>Reset</span>
                    </div>
                    <div className={styles.amountInputContainer} style={{ borderColor: themeColor }}>
                        <span className={styles.currencySymbol}>₹</span>
                        <input
                            type="number"
                            className={styles.amountInput}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={isIn ? "0" : "Enter Amount"}
                        />
                    </div>
                    {isIn && <div className={styles.pendingText}>Pending ₹{party.balance?.toFixed(2) || '0.00'}</div>}
                </div>

                {/* Date Picker */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Payment date</label>
                    <div className={styles.dateInputContainer}>
                        <input
                            type="date"
                            className={styles.dateInput}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <FiCalendar className={styles.calendarIcon} />
                    </div>
                </div>

                {/* Payment Type */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Payment type</label>
                    <div className={styles.chipContainer}>
                        {paymentTypes.map(type => (
                            <div
                                key={type}
                                className={styles.chip}
                                style={paymentType === type ? { background: themeBg, color: themeText } : {}}
                                onClick={() => setPaymentType(type)}
                            >
                                {paymentType === type && <span className={styles.checkIcon}>✓</span>}
                                {type}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bank */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Bank</label>
                    {/* Mock Bank Selection for 'You Gave' as per screenshot */}
                    {!isIn && (
                        <button className={styles.bankButton} style={{ background: '#2563eb', color: 'white', border: 'none', marginRight: '8px' }}>
                            <span style={{ fontSize: '10px', display: 'block' }}>✓</span>
                            IDFC FIRST Bank
                            <span style={{ fontSize: '10px', display: 'block', opacity: 0.8 }}>xx6789</span>
                        </button>
                    )}
                    <button className={styles.addNewButton}>
                        <FiPlus /> Add New
                    </button>
                </div>

                {/* Notes */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Notes</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Enter your notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className={styles.divider} />

                <div className={styles.sectionTitleBold}>Other Details</div>

                {/* Internal Notes */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Internal notes</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Enter your notes..."
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                    />
                </div>

                {/* Attachments */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Attachments (Max: 3)</label>
                    <div className={styles.attachmentButtons}>
                        <button className={styles.attachmentButton}>
                            <FiCamera size={18} /> Camera
                        </button>
                        <button className={styles.attachmentButton}>
                            <FiUpload size={18} /> Upload File
                        </button>
                    </div>
                </div>

                {/* Toggles */}
                {/* Note: Screenshot for 'You Gave' doesn't explicitly show toggles but 'You Got' did. Keeping them for consistency or hiding if needed. 
                    The 'You Gave' screenshot ends at attachments. Let's keep them but maybe they are below fold.
                    Actually, let's keep them as they are useful features.
                */}
                <div className={styles.toggleGroup}>
                    <div>
                        <div className={styles.toggleLabel}>SMS to {isVendor ? 'Vendor' : 'Customer'}</div>
                        <div className={styles.toggleSubLabel}>We'll send a confirmation to their mobile no.</div>
                    </div>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={sendSms} onChange={(e) => setSendSms(e.target.checked)} />
                        <span className={styles.slider} style={sendSms ? { backgroundColor: themeColor } : {}}></span>
                    </label>
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    {isIn ? (
                        <div className={styles.footerAmount}>
                            <div className={styles.footerLabel}>Pay In Amount</div>
                            <div className={styles.footerValue}>₹{amount || '0'}</div>
                        </div>
                    ) : (
                        <div className={styles.cancelButton} onClick={() => router.back()}>
                            Cancel
                        </div>
                    )}

                    <AnimatedButton
                        className={styles.recordButton}
                        style={{ background: themeColor, flex: isIn ? 'initial' : 1 }} // Expand button in 'You Gave' mode
                        onClick={handleRecord}
                    >
                        Record
                    </AnimatedButton>
                </div>
            </div>
        </div>
    );
}

export default function RecordPaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RecordPaymentContent />
        </Suspense>
    );
}
