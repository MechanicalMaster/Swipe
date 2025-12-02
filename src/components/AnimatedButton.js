'use client';

import { motion } from 'framer-motion';
import { ANIMATIONS } from '@/lib/animations';

export default function AnimatedButton({ children, className, onClick, ...props }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{
                duration: ANIMATIONS.duration.fast,
                ease: ANIMATIONS.ease.out,
            }}
            className={className}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
}
