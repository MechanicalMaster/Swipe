'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FiX, FiZap, FiZapOff, FiCamera, FiAlertCircle } from 'react-icons/fi';
import styles from './BarcodeScanner.module.css';
import { logger, LOG_EVENTS } from '@/lib/logger';

// Permission states
const PERMISSION_STATE = {
    CHECKING: 'checking',
    GRANTED: 'granted',
    DENIED: 'denied',
    PROMPT: 'prompt',
    UNSUPPORTED: 'unsupported',
    INSECURE: 'insecure'
};

export default function BarcodeScanner({ isOpen, onScan, onClose, onManualEntry }) {
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [error, setError] = useState(null);
    const [permissionState, setPermissionState] = useState(PERMISSION_STATE.CHECKING);
    const [manualBarcode, setManualBarcode] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);

    // Check if camera API is available
    const checkCameraSupport = useCallback(async () => {
        // Check HTTPS requirement (camera won't work on insecure origins except localhost)
        const isSecure = window.location.protocol === 'https:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

        if (!isSecure && !window.Capacitor?.isNative) {
            setPermissionState(PERMISSION_STATE.INSECURE);
            setError('Camera requires a secure connection (HTTPS). Please access this page via HTTPS.');
            return false;
        }

        // Check if mediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setPermissionState(PERMISSION_STATE.UNSUPPORTED);
            setError('Camera is not supported on this browser. Please try a different browser or use manual entry.');
            return false;
        }

        // Check camera permission status (if Permissions API is available)
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'camera' });

                if (result.state === 'denied') {
                    setPermissionState(PERMISSION_STATE.DENIED);
                    setError('Camera permission was denied. Please enable camera access in your browser/device settings and try again.');
                    return false;
                } else if (result.state === 'granted') {
                    setPermissionState(PERMISSION_STATE.GRANTED);
                    return true;
                } else {
                    // 'prompt' - need to request permission
                    setPermissionState(PERMISSION_STATE.PROMPT);
                    return true;
                }
            } else {
                // Permissions API not available, try requesting directly
                setPermissionState(PERMISSION_STATE.PROMPT);
                return true;
            }
        } catch (err) {
            // Permissions API might not support 'camera' query, proceed anyway
            logger.info(LOG_EVENTS.PERMISSION_CHECK, { status: 'query_unsupported', error: err.message });
            setPermissionState(PERMISSION_STATE.PROMPT);
            return true;
        }
    }, []);

    // Request camera permission and start scanner
    const requestCameraAndStart = useCallback(async () => {
        try {
            setError(null);
            setPermissionState(PERMISSION_STATE.CHECKING);

            // First validate a stream can be obtained (triggers permission prompt if needed)
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            // Stop the test stream immediately
            stream.getTracks().forEach(track => track.stop());

            setPermissionState(PERMISSION_STATE.GRANTED);

            // Wait for the DOM element to be rendered
            let attempts = 0;
            let element = null;
            while (attempts < 50) { // Try for up to 2.5s
                element = document.getElementById('barcode-reader');
                if (element) break;
                await new Promise(resolve => setTimeout(resolve, 50));
                attempts++;
            }

            if (!element) {
                throw new Error("Scanner element could not be initialized (DOM element not found)");
            }

            // Now start the Html5Qrcode scanner
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
                    logger.info(LOG_EVENTS.PRODUCT_SCAN, { barcode: decodedText });
                    onScan(decodedText);
                },
                (errorMessage) => {
                    // Ignore scan errors (no QR found in frame)
                }
            );
        } catch (err) {
            logger.error(LOG_EVENTS.PRODUCT_SCAN_ERROR, { error: err.message, name: err.name });

            // Handle specific error types
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionState(PERMISSION_STATE.DENIED);
                setError('Camera permission denied. Please allow camera access in your browser settings to scan barcodes.');
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setPermissionState(PERMISSION_STATE.UNSUPPORTED);
                setError('No camera found on this device. Please use the manual entry option.');
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError('Camera is in use by another application. Please close other apps using the camera and try again.');
            } else if (err.name === 'OverconstrainedError') {
                // Try again without facingMode constraint
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    stream.getTracks().forEach(track => track.stop());

                    html5QrCodeRef.current = new Html5Qrcode('barcode-reader');
                    await html5QrCodeRef.current.start(
                        { facingMode: 'user' },
                        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                        (decodedText) => { stopScanner(); onScan(decodedText); },
                        () => { }
                    );
                    setPermissionState(PERMISSION_STATE.GRANTED);
                    return;
                } catch (fallbackErr) {
                    setError('Could not access camera with required settings. Please try manual entry.');
                }
            } else {
                setError(`Camera error: ${err.message || 'Unknown error'}. Please try again or use manual entry.`);
            }
        }
    }, [onScan]);

    useEffect(() => {
        if (!isOpen) return;

        const startScanner = async () => {
            // Wait for DOM element to be available
            await new Promise(resolve => requestAnimationFrame(resolve));

            const canProceed = await checkCameraSupport();
            if (canProceed) {
                await requestCameraAndStart();
            }
        };

        startScanner();

        return () => {
            stopScanner();
        };
    }, [isOpen, checkCameraSupport, requestCameraAndStart]);

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
                logger.warn('SCANNER_STOP_WARNING', { error: err.message });
            }
        }
    };

    const handleClose = () => {
        stopScanner();
        onClose();
    };

    const handleRetry = async () => {
        // Clear error first - this triggers re-render to show the reader div
        setError(null);
        setPermissionState(PERMISSION_STATE.CHECKING);

        // Wait for React to re-render
        await new Promise(resolve => setTimeout(resolve, 100));

        const canProceed = await checkCameraSupport();
        if (canProceed) {
            await requestCameraAndStart();
        }
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
                    <div className={styles.errorContainer}>
                        <FiAlertCircle size={48} color="#ef4444" />
                        <div className={styles.errorMessage}>{error}</div>
                        {permissionState !== PERMISSION_STATE.UNSUPPORTED &&
                            permissionState !== PERMISSION_STATE.INSECURE && (
                                <button className={styles.retryBtn} onClick={handleRetry}>
                                    <FiCamera size={18} />
                                    Try Again
                                </button>
                            )}
                    </div>
                ) : permissionState === PERMISSION_STATE.CHECKING ? (
                    <div className={styles.loadingMessage}>
                        <FiCamera size={48} color="#3b82f6" />
                        <div>Requesting camera access...</div>
                    </div>
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
                {error ? 'Use manual entry below or fix the issue above' : 'Align the barcode within the frame'}
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

