import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRouter, usePathname } from 'next/navigation';

export const useBackButton = () => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleBackButton = async () => {
            App.addListener('backButton', ({ canGoBack }) => {
                if (pathname === '/') {
                    App.exitApp();
                } else {
                    router.back();
                }
            });
        };

        handleBackButton();

        return () => {
            App.removeAllListeners();
        };
    }, [router, pathname]);
};
