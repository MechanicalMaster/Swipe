'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATIONS } from '@/lib/animations';
import styles from './BottomSheet.module.css';

export default function BottomSheet({ isOpen, onClose, children }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: ANIMATIONS.duration.fast }}
                    className={styles.overlay}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                        }}
                        className={styles.sheet}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.handleBar}>
                            <div className={styles.handle} />
                        </div>
                        <div className={styles.content}>
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
