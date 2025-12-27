
import { logger } from './logger';
import { getDevice } from './context';

// Dynamic import strategy for storage reading
const getStorageReader = async () => {
    const device = getDevice();
    let storage;

    if (device !== 'web') {
        const { CapacitorStorage } = await import('./storage/capacitorFs');
        storage = new CapacitorStorage();
    } else {
        const { IndexedDbStorage } = await import('./storage/indexedDb');
        storage = new IndexedDbStorage();
    }

    // We need to init to ensure DB/Files are accessible
    await storage.init();
    return storage;
};

export const exportLogs = async () => {
    try {
        const storage = await getStorageReader();
        const logs = await storage.readAll('logs');
        const audits = await storage.readAll('audit');

        const exportData = {
            exportedAt: new Date().toISOString(),
            device: getDevice(),
            logs,
            auditLogs: audits
        };

        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        return blob;
    } catch (error) {
        logger.error('LOG_EXPORT_FAILED', { error: error['message'] });
        throw error;
    }
};

// Helper to trigger download in browser
export const triggerLogDownload = async () => {
    try {
        const blob = await exportLogs();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `swipe-logs-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    } catch (e) {
        console.error('Failed to export logs', e);
        return false;
    }
};
