'use client';

import { useRouter } from 'next/navigation';
import ServerSetup from '@/components/ServerConfig/ServerSetup';

export default function ServerConfigPage() {
    const router = useRouter();

    return (
        <ServerSetup onConfigured={() => {
            router.back();
            // Alternatively, trigger a refresh/reauth if key info changed
        }} />
    );
}
