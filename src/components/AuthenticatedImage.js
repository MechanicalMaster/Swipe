'use client';

import { useAuthenticatedImage } from '@/lib/hooks/useAuthenticatedImage';

/**
 * Image component that loads images with authentication
 * Automatically handles Authorization header and blob URL management
 * 
 * @param {Object} props
 * @param {string} props.src - Image URL from API (e.g., "/api/photos/uuid")
 * @param {string} [props.alt] - Alt text for the image
 * @param {string} [props.className] - CSS class name
 * @param {React.ReactNode} [props.fallback] - Fallback content when loading or on error
 * @param {Object} [props.style] - Inline styles
 */
export default function AuthenticatedImage({
    src: imageUrl,
    alt = '',
    className = '',
    fallback = null,
    style = {},
    ...rest
}) {
    const { src, loading, error } = useAuthenticatedImage(imageUrl);

    // Show fallback while loading or on error
    if (loading || error || !src) {
        return fallback;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            style={style}
            {...rest}
        />
    );
}
