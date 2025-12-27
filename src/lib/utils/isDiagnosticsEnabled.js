/**
 * Build-time flag for Diagnostics feature
 * 
 * This constant is evaluated at build time by Next.js.
 * When false/undefined, all code paths using this flag are eliminated
 * via dead code elimination (tree-shaking).
 * 
 * To enable: Set NEXT_PUBLIC_ENABLE_DIAGNOSTICS=true in your environment
 */
export const DIAGNOSTICS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS === 'true';

/**
 * Check if diagnostics feature should be available
 * Use this for conditional rendering of UI elements
 */
export const isDiagnosticsEnabled = () => DIAGNOSTICS_ENABLED;

