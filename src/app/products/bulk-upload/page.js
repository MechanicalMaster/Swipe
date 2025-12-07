'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiUploadCloud, FiFileText, FiAlertCircle, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { BulkUploadService } from '@/lib/services/bulkUploadService';
import styles from './page.module.css';
import Link from 'next/link';

export default function BulkUploadPage() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [validationState, setValidationState] = useState({
        status: 'idle', // idle, validating, valid, invalid 
        errors: [],
        data: [],
        totalReceived: 0
    });
    const [processingState, setProcessingState] = useState({
        status: 'idle', // idle, processing, complete, error
        successCount: 0,
        failureCount: 0,
        failedRows: []
    });

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                alert('Please upload a CSV file.');
                return;
            }
            setFile(selectedFile);
            setValidationState({ status: 'idle', errors: [], data: [], totalReceived: 0 });
            setProcessingState({ status: 'idle', successCount: 0, failureCount: 0, failedRows: [] });
        }
    };

    const handleDownloadTemplate = () => {
        BulkUploadService.downloadTemplate();
    };

    const handleValidate = async () => {
        if (!file) return;

        setValidationState(prev => ({ ...prev, status: 'validating' }));
        try {
            const result = await BulkUploadService.validateFile(file);
            setValidationState({
                status: result.valid ? 'valid' : 'invalid',
                errors: result.errors,
                data: result.data,
                totalReceived: result.totalReceived
            });
        } catch (error) {
            console.error(error);
            setValidationState({
                status: 'invalid',
                errors: ['Failed to validate file. Please check format.'],
                data: [],
                totalReceived: 0
            });
        }
    };

    const handleProcess = async () => {
        if (validationState.status !== 'valid') return;

        setProcessingState({ status: 'processing', successCount: 0, failureCount: 0, failedRows: [] });
        try {
            const result = await BulkUploadService.processFile(validationState.data);
            setProcessingState({
                status: 'complete',
                successCount: result.successCount,
                failureCount: result.failureCount,
                failedRows: result.failedRows
            });
            // Optional: reset file after success? 
            // setFile(null); 
        } catch (error) {
            console.error(error);
            setProcessingState({ status: 'error', successCount: 0, failureCount: 0, failedRows: [] });
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/products">
                    <FiArrowLeft size={24} color="#111827" style={{ cursor: 'pointer' }} />
                </Link>
                <h1 className={styles.title}>Bulk Product Upload</h1>
            </div>

            {/* Step 1: Download Template */}
            <div className={styles.card}>
                <h2 className={styles.sectionTitle}>1. Download Template</h2>
                <p className={styles.sectionDesc}>
                    Use this standardized CSV template to enter your product details.
                    Do not change the column headers.
                </p>
                <button
                    onClick={handleDownloadTemplate}
                    className={`${styles.button} ${styles.outlineButton}`}
                >
                    <FiDownload size={18} />
                    Download CSV Template
                </button>
            </div>

            {/* Step 2: Upload CSV */}
            <div className={styles.card}>
                <h2 className={styles.sectionTitle}>2. Upload CSV File</h2>
                <p className={styles.sectionDesc}>
                    Upload your filled CSV file here. Ensure all mandatory fields are present.
                </p>

                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />

                <div
                    className={styles.dropZone}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FiUploadCloud size={48} color="#9ca3af" />
                    <p style={{ marginTop: 12, color: '#4b5563', fontWeight: 500 }}>
                        Click to upload CSV
                    </p>
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>
                        Supported format: .csv
                    </p>
                </div>

                {file && (
                    <div className={styles.fileInfo}>
                        <FiFileText size={20} color="#4b5563" />
                        <span style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{file.name}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); setValidationState({ status: 'idle', errors: [], data: [], totalReceived: 0 }); }}
                            style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {/* Step 3: Validation & Processing */}
            {file && (
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>3. Validate & Process</h2>

                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                        <button
                            onClick={handleValidate}
                            className={`${styles.button} ${styles.outlineButton}`}
                            disabled={validationState.status === 'validating' || processingState.status === 'processing' || processingState.status === 'complete'}
                            style={{ opacity: (validationState.status === 'validating' || processingState.status === 'processing') ? 0.7 : 1 }}
                        >
                            {validationState.status === 'validating' ? <FiLoader className="spin" /> : 'Validate File'}
                        </button>

                        <button
                            onClick={handleProcess}
                            className={`${styles.button} ${styles.primaryButton}`}
                            disabled={validationState.status !== 'valid'}
                            style={{ opacity: validationState.status !== 'valid' ? 0.5 : 1, cursor: validationState.status !== 'valid' ? 'not-allowed' : 'pointer' }}
                        >
                            {processingState.status === 'processing' ? (
                                <>
                                    <FiLoader className="spin" /> Processing...
                                </>
                            ) : 'Upload & Process'}
                        </button>
                    </div>

                    {/* Validation Errors */}
                    {validationState.status === 'invalid' && validationState.errors.length > 0 && (
                        <div className={styles.validationResults}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#dc2626' }}>
                                <FiAlertCircle />
                                <span style={{ fontWeight: 600 }}>Validation Failed</span>
                            </div>
                            <div className={styles.errorList}>
                                {validationState.errors.map((err, idx) => (
                                    <div key={idx} className={styles.errorItem}>• {err}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Validation Success */}
                    {validationState.status === 'valid' && processingState.status === 'idle' && (
                        <div className={styles.validationResults}>
                            <div className={styles.successSummary}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiCheckCircle size={20} />
                                    <span style={{ fontWeight: 600 }}>Validation Successful!</span>
                                </div>
                                <p style={{ marginTop: 4, fontSize: 14 }}>
                                    Found {validationState.data.length} valid records out of {validationState.totalReceived}. Ready to process.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Processing Complete */}
                    {processingState.status === 'complete' && (
                        <div className={styles.validationResults}>
                            <div className={styles.successSummary} style={{ background: processingState.failureCount > 0 ? '#fff7ed' : '#f0fdf4', borderColor: processingState.failureCount > 0 ? '#fdba74' : '#bbf7d0', color: processingState.failureCount > 0 ? '#9a3412' : '#166534' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FiCheckCircle size={20} />
                                    <span style={{ fontWeight: 600 }}>Processing Complete</span>
                                </div>
                                <p style={{ marginTop: 4, fontSize: 14 }}>
                                    Successfully processed: <strong>{processingState.successCount}</strong>
                                </p>
                                {processingState.failureCount > 0 && (
                                    <p style={{ marginTop: 4, fontSize: 14, color: '#dc2626' }}>
                                        Failed: <strong>{processingState.failureCount}</strong>
                                    </p>
                                )}
                            </div>

                            {processingState.failedRows.length > 0 && (
                                <div className={styles.errorList} style={{ marginTop: 16 }}>
                                    <p style={{ fontWeight: 600, marginBottom: 8, color: '#dc2626' }}>Failed Rows Details:</p>
                                    {processingState.failedRows.map((item, idx) => (
                                        <div key={idx} className={styles.errorItem}>
                                            • Row {item.row.product_name || 'Generic'}: {item.error}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: 16 }}>
                                <Link href="/products">
                                    <button className={`${styles.button} ${styles.outlineButton}`}>
                                        Go back to Products
                                    </button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
