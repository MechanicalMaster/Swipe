'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to products page with select mode
export default function SelectProductPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the unified products page with select mode enabled
        router.replace('/products?mode=select&returnUrl=/invoice/create');
    }, [router]);

    return (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
            Loading products...
        </div>
    );
}
