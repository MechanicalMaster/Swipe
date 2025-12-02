'use client';

import { motion } from 'framer-motion';
import { ANIMATIONS } from '@/lib/animations';

export default function Template({ children }) {
    return (
        <motion.div
            initial={ANIMATIONS.variants.slideUp.initial}
            animate={ANIMATIONS.variants.slideUp.animate}
            transition={{
                duration: ANIMATIONS.duration.medium,
                ease: ANIMATIONS.ease.out,
            }}
            className="page-transition-container"
        >
            {children}
        </motion.div>
    );
}
