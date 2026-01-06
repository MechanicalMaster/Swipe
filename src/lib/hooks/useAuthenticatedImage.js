'use client';

import { useState, useEffect } from 'react';
import { api } from '@/api/backendClient';

/**
 * Hook to load an authenticated image and return a blob URL
 * @param {string} imageUrl - The image URL from API (e.g., "/api/photos/uuid")
 * @returns {{ src: string | null, loading: boolean, error: string | null }}
 */
export function useAuthenticatedImage(imageUrl) {
    const [src, setSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!imageUrl) {
            setLoading(false);
            return;
        }

        let blobUrl = null;
        let cancelled = false;

        const loadImage = async () => {
            try {
                setLoading(true);
                setError(null);

                const fullUrl = api.photos.getFullUrl(imageUrl);
                const token = localStorage.getItem('auth_token');

                const response = await fetch(fullUrl, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (!response.ok) {
                    throw new Error(`Failed to load image: ${response.status}`);
                }

                const blob = await response.blob();

                if (!cancelled) {
                    blobUrl = URL.createObjectURL(blob);
                    setSrc(blobUrl);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Image load failed:', err);
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadImage();

        // Cleanup: revoke blob URL when component unmounts or URL changes
        return () => {
            cancelled = true;
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [imageUrl]);

    return { src, loading, error };
}

/**
 * Standalone function to load authenticated image (for non-hook contexts)
 * Remember to call URL.revokeObjectURL() when done to prevent memory leaks
 * @param {string} imageUrl - The image URL from API
 * @returns {Promise<string>} Blob URL for the image
 */
export async function loadAuthenticatedImage(imageUrl) {
    if (!imageUrl) return null;

    const fullUrl = api.photos.getFullUrl(imageUrl);
    const token = localStorage.getItem('auth_token');

    const response = await fetch(fullUrl, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

export default useAuthenticatedImage;
