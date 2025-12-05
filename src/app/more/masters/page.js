'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MastersPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/more/masters/products');
    }, []);

    return null;
}
