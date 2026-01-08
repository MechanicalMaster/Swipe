'use client';

import { useState, useCallback } from 'react';

/**
 * Form validation hook with explicit save state management.
 * 
 * Save state machine: idle → draft → saving → saved → failed
 * 
 * @param {import('zod').ZodSchema} schema - Zod schema for validation
 * @returns {Object} Form validation state and actions
 */
export function useFormValidation(schema) {
    // Save state: 'idle' | 'draft' | 'saving' | 'saved' | 'failed'
    const [saveStatus, setSaveStatus] = useState('idle');
    const [lastSavedAt, setLastSavedAt] = useState(null);
    // errors is a flat object: { fieldName: 'error message' }
    const [errors, setErrors] = useState({});
    const [saveError, setSaveError] = useState(null);

    /**
     * Validate data against schema.
     * Returns flat errors object keyed by field name.
     * @param {Object} data - Form data to validate
     * @returns {{ success: boolean, errors: Object }}
     */
    const validate = useCallback((data) => {
        const result = schema.safeParse(data);

        if (result.success) {
            setErrors({});
            return { success: true, errors: {} };
        }

        // Flatten Zod errors to { fieldName: 'message' }
        const flatErrors = {};
        result.error.issues.forEach((issue) => {
            const key = issue.path.join('.');
            if (!flatErrors[key]) {
                flatErrors[key] = issue.message;
            }
        });

        setErrors(flatErrors);
        return { success: false, errors: flatErrors };
    }, [schema]);

    /**
     * Mark form as draft (user has made edits).
     * Optionally clear error for a specific field.
     * @param {string} [field] - Field name to clear error for
     */
    const markDraft = useCallback((field) => {
        setSaveStatus('draft');
        setSaveError(null);
        if (field) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    }, []);

    /**
     * Start saving. Only transitions if not already saving.
     * @returns {boolean} True if transition happened, false if already saving
     */
    const startSaving = useCallback(() => {
        if (saveStatus === 'saving') {
            return false; // Double-submit prevention
        }
        setSaveStatus('saving');
        setSaveError(null);
        return true;
    }, [saveStatus]);

    /**
     * Mark save as successful.
     */
    const markSaved = useCallback(() => {
        setSaveStatus('saved');
        setLastSavedAt(new Date());
        setErrors({});
        setSaveError(null);
    }, []);

    /**
     * Mark save as failed.
     * Accepts network errors and backend failures.
     * Never overrides client-side validation errors.
     * @param {Error|string} error - The error that occurred
     */
    const markFailed = useCallback((error) => {
        setSaveStatus('failed');
        const message = error?.message || error || 'Save failed';
        setSaveError(message);
        // Don't clear errors - preserve any client validation errors
    }, []);

    /**
     * Clear validation errors.
     * @param {string} [field] - Optional field to clear, or all if omitted
     */
    const clearErrors = useCallback((field) => {
        if (field) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        } else {
            setErrors({});
        }
    }, []);

    /**
     * Reset to initial state.
     */
    const reset = useCallback(() => {
        setSaveStatus('idle');
        setLastSavedAt(null);
        setErrors({});
        setSaveError(null);
    }, []);

    /**
     * Format lastSavedAt as "HH:MM"
     */
    const lastSavedAtFormatted = lastSavedAt
        ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : null;

    return {
        saveStatus,
        lastSavedAt,
        lastSavedAtFormatted,
        errors,
        saveError,
        validate,
        markDraft,
        startSaving,
        markSaved,
        markFailed,
        clearErrors,
        reset,
    };
}
