export const ANIMATIONS = {
    // Durations
    duration: {
        fast: 0.2,
        medium: 0.3,
        slow: 0.5,
    },
    // Easings
    ease: {
        // Smooth, modern ease-out
        out: [0.25, 0.1, 0.25, 1.0],
        // Bouncy for playful elements
        elastic: [0.5, 1.5, 0.5, 0.8],
    },
    // Variants
    variants: {
        fadeIn: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        slideUp: {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -10 },
        },
        scaleIn: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
        },
        staggerContainer: {
            animate: {
                transition: {
                    staggerChildren: 0.05,
                },
            },
        },
        listItem: {
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
        },
    },
};
