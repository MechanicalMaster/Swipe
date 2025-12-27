'use client';

import { useState } from 'react';
import { api } from '@/api/backendClient';
import styles from './ServerSetup.module.css';

export default function ServerSetup({ onConfigured }) {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState('idle'); // idle, testing, success, error
    const [message, setMessage] = useState('');

    const handleTestAndSave = async () => {
        if (!url) {
            setMessage('Please enter a URL');
            setStatus('error');
            return;
        }

        // Normalization
        let cleanUrl = url.trim().replace(/\/$/, '');
        if (!/^https?:\/\//i.test(cleanUrl)) {
            setMessage('URL must start with http:// or https://');
            setStatus('error');
            return;
        }

        setStatus('testing');
        setMessage('Testing connection...');

        try {
            // Test the connection directly
            // We append /health or just check the root/api health
            // Assuming the user enters the BASE URL e.g. http://192.168.1.5:3000/api
            // Or just the host? The user request said "http://192.168.1.25:3000" and existing code adds /api often.
            // Existing backendClient says: API_BASE = .../api
            // So if user enters http://host:port, we might need to append /api depending on convention.
            // Let's assume user enters the full base or host.
            // Best UX: User enters "http://192.168.1.5:3000", we auto-append /api if missing?
            // Let's try raw fetch to /health endpoint which seems to be at host/health based on backendClient

            // BackendClient: health: () => fetch(`${API_BASE.replace('/api', '')}/health`)
            // So if API_BASE is http://localhost:3000/api, it fetches http://localhost:3000/health

            // let's try to construct the probable health URL
            let testUrl = cleanUrl;
            if (!testUrl.endsWith('/api')) {
                // If user didn't add /api, maybe they shouldn't?
                // But the app needs /api to be part of the base usually? 
                // Let's stick to the convention in backendClient.
                // If the user inputs http://x.x.x.x:3000, we likely want to save http://x.x.x.x:3000/api
                // So let's test http://x.x.x.x:3000/health
            }

            // Heuristic: If url ends with /api, remove it for health check
            const healthUrl = cleanUrl.endsWith('/api')
                ? `${cleanUrl.replace(/\/api$/, '')}/health`
                : `${cleanUrl}/health`;

            const res = await fetch(healthUrl);

            if (res.ok) {
                setStatus('success');
                setMessage('Connected! Saving...');

                // Determine what to save. 
                // If user entered http://.../api, save it. 
                // If user entered http://..., append /api?
                // Let's ask the user in the generic case, or just standardization.
                // Default API_BASE was http://localhost:3000/api
                // So we want the stored URL to end in /api

                let finalBaseUrl = cleanUrl;
                if (!finalBaseUrl.endsWith('/api')) {
                    finalBaseUrl = `${finalBaseUrl}/api`;
                }

                await api.setApiBase(finalBaseUrl);

                setTimeout(() => {
                    if (onConfigured) onConfigured();
                }, 1000);
            } else {
                throw new Error('Health check returned ' + res.status);
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setMessage(`Connection failed: ${err.message}`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Connect to Backend</h2>
                <p className={styles.subtitle}>
                    Enter the URL of your local server.<br />
                    Example: http://192.168.1.15:3000
                </p>

                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="http://192.168.x.x:3000"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={status === 'testing' || status === 'success'}
                    />
                </div>

                {message && (
                    <div className={`${styles.message} ${styles[status]}`}>
                        {message}
                    </div>
                )}

                <button
                    className={styles.button}
                    onClick={handleTestAndSave}
                    disabled={status === 'testing' || status === 'success'}
                >
                    {status === 'testing' ? 'Testing...' : 'Connect'}
                </button>
            </div>
        </div>
    );
}
