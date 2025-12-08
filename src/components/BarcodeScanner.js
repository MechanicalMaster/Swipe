'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FiX, FiZap, FiZapOff } from 'react-icons/fi';
import styles from './BarcodeScanner.module.css';

export default function BarcodeScanner({ isOpen, onScan, onClose, onManualEntry }) {
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [error, setError] = useState(null);
    const [manualBarcode, setManualBarcode] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const startScanner = async () => {
            try {
                html5QrCodeRef.current = new Html5Qrcode('barcode-reader');

                await html5QrCodeRef.current.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
                    (decodedText) => {
                        // Successfully scanned
                        stopScanner();
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // Ignore scan errors (no QR found in frame)
                    }
                );
            } catch (err) {
                console.error('Scanner error:', err);
                setError('Camera access denied. Please allow camera permission.');
            }
        };

        startScanner();

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                const state = html5QrCodeRef.current.getState();
                // Only stop if actually scanning (state 2 = SCANNING, state 3 = PAUSED)
                if (state === 2 || state === 3) {
                    await html5QrCodeRef.current.stop();
                }
                html5QrCodeRef.current = null;
            } catch (err) {
                // Silently ignore stop errors
                console.warn('Scanner stop warning:', err);
            }
        }
    };

    const handleClose = () => {
        stopScanner();
        onClose();
    };

    const toggleFlash = async () => {
        // Flash toggle requires torch capability
        // This may not work on all devices
        setIsFlashOn(!isFlashOn);
    };

    const handleManualSubmit = () => {
        if (manualBarcode.trim()) {
            onScan(manualBarcode.trim());
            setManualBarcode('');
            setShowManualInput(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.headerBtn} onClick={handleClose}>
                    <FiX size={24} />
                    <span>Close</span>
                </button>
                <button className={styles.headerBtn} onClick={toggleFlash}>
                    {isFlashOn ? <FiZap size={24} /> : <FiZapOff size={24} />}
                    <span>Flash</span>
                </button>
            </div>

            {/* Scanner Area */}
            <div className={styles.scannerContainer}>
                {error ? (
                    <div className={styles.errorMessage}>{error}</div>
                ) : (
                    <>
                        <div id="barcode-reader" className={styles.reader} ref={scannerRef}></div>
                        <div className={styles.scanFrame}>
                            <div className={styles.corner + ' ' + styles.topLeft}></div>
                            <div className={styles.corner + ' ' + styles.topRight}></div>
                            <div className={styles.corner + ' ' + styles.bottomLeft}></div>
                            <div className={styles.corner + ' ' + styles.bottomRight}></div>
                        </div>
                    </>
                )}
            </div>

            {/* Instructions */}
            <div className={styles.instructions}>
                Align the barcode within the frame
            </div>

            {/* Manual Entry */}
            {showManualInput ? (
                <div className={styles.manualInputContainer}>
                    <input
                        type="text"
                        className={styles.manualInput}
                        placeholder="Enter barcode..."
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        autoFocus
                    />
                    <button className={styles.submitBtn} onClick={handleManualSubmit}>
                        Submit
                    </button>
                </div>
            ) : (
                <button
                    className={styles.manualEntryBtn}
                    onClick={() => setShowManualInput(true)}
                >
                    Enter Barcode Manually
                </button>
            )}
        </div>
    );
}
