'use client';

import { useBackButton } from '@/lib/hooks/useBackButton';

export default function BackButtonHandler() {
    useBackButton();
    return null;
}
