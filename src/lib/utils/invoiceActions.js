'use client';

/**
 * Centralized Invoice Actions Utility
 * Handles share, download, and view operations with proper Capacitor/native support
 */

import { generatePDF } from './pdf';
import { api } from '@/api/backendClient';
import { logger, LOG_EVENTS } from '@/lib/logger';

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

/**
 * Check if running in Capacitor native environment
 */
export const isNativePlatform = () => {
    return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNative;
};

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

let toastCallback = null;

/**
 * Register a callback to show toast messages
 * Called by ToastProvider component on mount
 */
export const registerToastCallback = (callback) => {
    toastCallback = callback;
};

/**
 * Show a toast notification to the user
 * @param {string} message - Message to display
 * @param {'success' | 'error' | 'info'} type - Toast type
 */
export const showToast = (message, type = 'info') => {
    logger.info(LOG_EVENTS.TOAST_SHOWN, { message, type });
    if (toastCallback) {
        toastCallback(message, type);
    } else {
        // Fallback to alert if Toast component not mounted
        if (type === 'error') {
            alert(`Error: ${message}`);
        }
    }
};

// ============================================================================
// FILE SYSTEM UTILITIES (NATIVE)
// ============================================================================

/**
 * Convert Blob to base64 string
 */
const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            const pureBase64 = base64data.split(',')[1];
            resolve(pureBase64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Write file to device storage (native only)
 * @returns {Promise<{uri: string, path: string}>} File result with URI
 */
const writeFileNative = async (fileName, blob, directory = 'Cache') => {
    try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const base64 = await blobToBase64(blob);

        const directoryMap = {
            'Cache': Directory.Cache,
            'Documents': Directory.Documents,
            'Data': Directory.Data,
            'External': Directory.External,
            'ExternalStorage': Directory.ExternalStorage
        };

        const result = await Filesystem.writeFile({
            path: fileName,
            data: base64,
            directory: directoryMap[directory] || Directory.Cache
        });

        return result;
    } catch (error) {
        logger.error('NATIVE_WRITE_FAILED', { fileName, error: error.message });
        throw error;
    }
};

// ============================================================================
// SHARE UTILITIES
// ============================================================================

/**
 * Share invoice as PDF
 * @param {object} invoice - Invoice data object
 * @returns {Promise<boolean>} Success status
 */
export const shareInvoicePDF = async (invoice) => {
    if (!invoice) {
        showToast('No invoice to share', 'error');
        return false;
    }

    try {
        // Get settings from backend API
        const settings = await api.settings.get();

        const templateId = invoice.type === 'LENDING'
            ? (settings.lendingBillTemplateId || 'modern')
            : (settings.templateId || 'modern');
        const companyDetails = settings.companyDetails || {};

        logger.info(LOG_EVENTS.INVOICE_PDF_GENERATING, { invoiceNumber: invoice.invoiceNumber });
        const blob = await generatePDF({
            ...invoice,
            templateId,
            companyDetails,
            returnBlob: true
        });

        const fileName = `Invoice-${invoice.invoiceNumber}.pdf`;

        if (isNativePlatform()) {
            logger.info(LOG_EVENTS.SHARE_PLATFORM_NATIVE, { fileName });

            // Write to cache for sharing
            const result = await writeFileNative(fileName, blob, 'Cache');

            // Share the file
            const { Share } = await import('@capacitor/share');
            await Share.share({
                title: `Invoice ${invoice.invoiceNumber}`,
                text: `Please find attached invoice ${invoice.invoiceNumber}`,
                files: [result.uri],
                dialogTitle: 'Send Invoice'
            });

            logger.info(LOG_EVENTS.INVOICE_SHARED, { method: 'native', invoiceNumber: invoice.invoiceNumber });
            return true;
        } else {
            logger.info(LOG_EVENTS.SHARE_PLATFORM_WEB, { fileName });
            const file = new File([blob], fileName, { type: 'application/pdf' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Invoice ${invoice.invoiceNumber}`,
                    text: `Please find attached invoice ${invoice.invoiceNumber}`,
                    files: [file]
                });
                logger.info(LOG_EVENTS.INVOICE_SHARED, { method: 'web_share', invoiceNumber: invoice.invoiceNumber });
                return true;
            } else {
                // Fallback: download the file
                logger.info(LOG_EVENTS.SHARE_PLATFORM_WEB, { method: 'fallback_download' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
                showToast('Sharing not supported - file downloaded instead', 'info');
                return true;
            }
        }
    } catch (error) {
        logger.error(LOG_EVENTS.INVOICE_SHARE_FAILED, { error: error.message, invoiceNumber: invoice?.invoiceNumber });
        if (error.name !== 'AbortError') {
            showToast('Failed to share invoice: ' + error.message, 'error');
        }
        return false;
    }
};

/**
 * Download invoice PDF to device
 * @param {object} invoice - Invoice data object
 * @returns {Promise<boolean>} Success status
 */
export const downloadInvoicePDF = async (invoice) => {
    if (!invoice) {
        showToast('No invoice to download', 'error');
        return false;
    }

    try {
        // Get settings from backend API
        const settings = await api.settings.get();

        const templateId = invoice.type === 'LENDING'
            ? (settings.lendingBillTemplateId || 'modern')
            : (settings.templateId || 'modern');
        const companyDetails = settings.companyDetails || {};

        const fileName = `Invoice-${invoice.invoiceNumber}.pdf`;

        if (isNativePlatform()) {
            logger.info(LOG_EVENTS.DOWNLOAD_PLATFORM_NATIVE, { fileName });
            const blob = await generatePDF({
                ...invoice,
                templateId,
                companyDetails,
                returnBlob: true
            });

            await writeFileNative(fileName, blob, 'Documents');
            showToast(`Invoice saved: ${fileName}`, 'success');
            logger.info(LOG_EVENTS.INVOICE_DOWNLOADED, { fileName, platform: 'native' });
            return true;
        } else {
            logger.info(LOG_EVENTS.DOWNLOAD_PLATFORM_WEB, { fileName });
            await generatePDF({ ...invoice, templateId, companyDetails });
            showToast('Invoice downloaded', 'success');
            logger.info(LOG_EVENTS.INVOICE_DOWNLOADED, { fileName, platform: 'web' });
            return true;
        }
    } catch (error) {
        logger.error(LOG_EVENTS.INVOICE_DOWNLOAD_FAILED, { error: error.message });
        showToast('Failed to download invoice: ' + error.message, 'error');
        return false;
    }
};

/**
 * Share simple text content
 * @param {object} options - Share options { title, text, url }
 * @returns {Promise<boolean>} Success status
 */
export const shareText = async (options) => {
    const { title, text, url, dialogTitle } = options;

    try {
        if (isNativePlatform()) {
            logger.info(LOG_EVENTS.SHARE_PLATFORM_NATIVE, { type: 'text' });
            const { Share } = await import('@capacitor/share');
            await Share.share({ title, text, url, dialogTitle });
            return true;
        } else {
            logger.info(LOG_EVENTS.SHARE_PLATFORM_WEB, { type: 'text' });
            if (navigator.share) {
                await navigator.share({ title, text, url });
                return true;
            } else {
                showToast('Sharing not supported on this device', 'info');
                return false;
            }
        }
    } catch (error) {
        logger.error(LOG_EVENTS.SHARE_FAILED, { error: error.message });
        if (error.name !== 'AbortError') {
            showToast('Failed to share: ' + error.message, 'error');
        }
        return false;
    }
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - File name
 * @returns {Promise<boolean>} Success status
 */
export const downloadCSV = async (csvContent, filename) => {
    try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        if (isNativePlatform()) {
            logger.info(LOG_EVENTS.DOWNLOAD_PLATFORM_NATIVE, { filename, type: 'csv' });
            await writeFileNative(filename, blob, 'Documents');
            showToast(`Exported: ${filename}`, 'success');
            return true;
        } else {
            logger.info(LOG_EVENTS.DOWNLOAD_PLATFORM_WEB, { filename, type: 'csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast(`Exported: ${filename}`, 'success');
            return true;
        }
    } catch (error) {
        logger.error(LOG_EVENTS.INVOICE_DOWNLOAD_FAILED, { error: error.message, filename });
        showToast('Failed to export: ' + error.message, 'error');
        return false;
    }
};

/**
 * Download PDF blob
 * @param {Blob} pdfBlob - PDF blob
 * @param {string} filename - File name
 * @returns {Promise<boolean>} Success status
 */
export const downloadPDFBlob = async (pdfBlob, filename) => {
    try {
        if (isNativePlatform()) {
            logger.info(LOG_EVENTS.DOWNLOAD_PLATFORM_NATIVE, { filename });
            await writeFileNative(filename, pdfBlob, 'Documents');
            showToast(`Exported: ${filename}`, 'success');
            return true;
        } else {
            logger.info(LOG_EVENTS.DOWNLOAD_PLATFORM_WEB, { filename });
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast(`Exported: ${filename}`, 'success');
            return true;
        }
    } catch (error) {
        logger.error(LOG_EVENTS.INVOICE_DOWNLOAD_FAILED, { error: error.message, filename });
        showToast('Failed to export: ' + error.message, 'error');
        return false;
    }
};
