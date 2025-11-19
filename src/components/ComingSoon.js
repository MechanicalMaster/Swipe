'use client';

import { useRouter } from 'next/navigation';
import { RiRocketLine, RiArrowLeftLine } from 'react-icons/ri';
import styles from './ComingSoon.module.css';

export default function ComingSoon({ showBackButton = true }) {
    const router = useRouter();

    return (
        <div className={styles.container}>
            <div className={styles.iconWrapper}>
                <RiRocketLine size={64} color="#2563eb" />
            </div>
            <h1 className={styles.title}>Coming Soon!</h1>
            <p className={styles.subtitle}>
                We are working hard to bring this feature to you. Stay tuned for updates!
            </p>
            {showBackButton && (
                <button className={styles.button} onClick={() => router.back()}>
                    <RiArrowLeftLine size={20} />
                    Go Back
                </button>
            )}
        </div>
    );
}
