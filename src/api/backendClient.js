/**
 * Centralized Backend API Client
 * 
 * All data operations must go through this layer.
 * Frontend must never cache backend data as authoritative.
 * 
 * Base URL is resolved dynamically from:
 * 1. Capacitor Preferences (mobile)
 * 2. localStorage (web fallback)
 */

import { Preferences } from '@capacitor/preferences';

// Request timeout in milliseconds
const REQUEST_TIMEOUT_MS = 7000;

/**
 * Normalize a URL to ensure it ends with /api
 * This prevents endpoint drift from misconfigured env vars or user input
 */
const normalizeApiBase = (url) => {
    if (!url) return null;
    let cleanUrl = url.trim();
    // Remove trailing slash
    if (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1);
    }
    // Ensure /api suffix
    if (!cleanUrl.endsWith('/api')) {
        cleanUrl = `${cleanUrl}/api`;
    }
    return cleanUrl;
};

// API_BASE is NOT initialized at module load - must be set dynamically
let API_BASE = null;
let isConfigured = false;

// Connection Listeners
const connectionListeners = new Set();
const notifyConnectionLost = () => {
    connectionListeners.forEach(l => l());
};

export const onConnectionError = (callback) => {
    connectionListeners.add(callback);
    return () => connectionListeners.delete(callback);
};

/**
 * Get localStorage value (web fallback)
 */
const getLocalStorageApiBase = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('api_base_url');
    }
    return null;
};

/**
 * Set localStorage value (web fallback)
 */
const setLocalStorageApiBase = (url) => {
    if (typeof window !== 'undefined') {
        if (url) {
            localStorage.setItem('api_base_url', url);
        } else {
            localStorage.removeItem('api_base_url');
        }
    }
};

/**
 * Initialize API base URL from persistent storage
 * Must be called before any API requests
 * @returns {Promise<string|null>} The configured API base URL
 */
export const getApiBase = async () => {
    try {
        // Try Capacitor Preferences first (mobile)
        const { value } = await Preferences.get({ key: 'api_base_url' });
        if (value) {
            API_BASE = normalizeApiBase(value);
            isConfigured = true;
            return API_BASE;
        }
    } catch (e) {
        // Capacitor not available (web), fall through to localStorage
    }

    // Fallback to localStorage (web)
    const localValue = getLocalStorageApiBase();
    if (localValue) {
        API_BASE = normalizeApiBase(localValue);
        isConfigured = true;
        return API_BASE;
    }

    // No configuration found
    API_BASE = null;
    isConfigured = false;
    return null;
};

/**
 * Set API base URL to persistent storage
 * @param {string} url - The backend URL to set
 */
export const setApiBase = async (url) => {
    // Normalize: trim, ensure /api suffix
    const cleanUrl = normalizeApiBase(url);
    if (!cleanUrl) {
        throw new Error('Invalid URL');
    }
    // Ensure protocol
    if (!/^https?:\/\//i.test(cleanUrl)) {
        throw new Error('Invalid URL protocol');
    }

    try {
        // Try Capacitor Preferences first (mobile)
        await Preferences.set({ key: 'api_base_url', value: cleanUrl });
    } catch (e) {
        // Capacitor not available, use localStorage
    }

    // Also set localStorage as fallback
    setLocalStorageApiBase(cleanUrl);

    API_BASE = cleanUrl;
    isConfigured = true;
};

/**
 * Check if backend is configured
 */
export const isBackendConfigured = () => isConfigured;

/**
 * Get the current API base URL (synchronous, for internal use)
 * Returns null if not configured
 */
export const getCurrentApiBase = () => API_BASE;

// Token management
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

export const setToken = (token) => {
    if (typeof window !== 'undefined') {
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }
};

export const clearToken = () => setToken(null);

/**
 * Generate a UUID v4 string.
 * 
 * IMPORTANT: Do NOT use crypto.randomUUID() directly in frontend code.
 * It is not supported in Android WebView / Capacitor environments and will
 * throw a runtime error, blocking the entire API client.
 * 
 * This helper uses crypto.randomUUID() when available (modern browsers),
 * and falls back to a Math.random-based RFC-4122 v4 generator otherwise.
 * 
 * @returns {string} A UUID v4 string (e.g., "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")
 */
const generateUUID = () => {
    // Use native crypto.randomUUID if available (not in Android WebView)
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        try {
            return crypto.randomUUID();
        } catch (e) {
            // Fall through to fallback
        }
    }

    // Fallback: Math.random-based RFC-4122 v4 UUID generator
    // Works in all environments including Android WebView / Capacitor
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// Alias for semantic clarity in API calls
const generateRequestId = generateUUID;

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(message, status, details, requestId) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
        this.requestId = requestId;
    }
}

/**
 * Core request function with error handling and timeout
 */
async function request(method, endpoint, data = null, options = {}) {
    // Ensure API_BASE is configured
    if (!API_BASE) {
        // Try to load it dynamically
        await getApiBase();
        if (!API_BASE) {
            throw new ApiError('Backend URL not configured. Please configure the server connection.', 0, null);
        }
    }

    const url = `${API_BASE}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
    };

    // Attach JWT token if available
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add idempotency key for mutative operations
    if (method === 'POST' || method === 'PUT') {
        headers['X-Request-Id'] = options.requestId || generateRequestId();
    }

    const config = {
        method,
        headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    config.signal = controller.signal;

    try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Handle 401 Unauthorized - clear token and throw error
        if (response.status === 401) {
            clearToken();
            throw new ApiError('Unauthorized', 401, null);
        }

        // Handle other errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.error || `Request failed with status ${response.status}`,
                response.status,
                errorData.details || null,
                errorData.requestId
            );
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
            throw error;
        }

        // Handle timeout (AbortError)
        if (error.name === 'AbortError') {
            console.error('API Request Timeout:', url);
            notifyConnectionLost();
            throw new ApiError(
                'Request timed out - server may be unreachable',
                0,
                null
            );
        }

        // Network error or other fetch error
        console.error('API Request Failed:', error);
        notifyConnectionLost();

        throw new ApiError(
            error.message || 'Network error - backend may be unavailable',
            0,
            null
        );
    }
}

/**
 * API Client with all endpoints
 */
export const api = {
    // Utilities
    init: getApiBase,
    setApiBase,
    onConnectionError,
    getCurrentApiBase,

    // Raw request methods
    get: (endpoint) => request('GET', endpoint),
    post: (endpoint, data, options) => request('POST', endpoint, data, options),
    put: (endpoint, data, options) => request('PUT', endpoint, data, options),
    patch: (endpoint, data, options) => request('PATCH', endpoint, data, options),
    delete: (endpoint) => request('DELETE', endpoint),

    // Health check - checks CURRENT base URL with timeout
    health: async () => {
        if (!API_BASE) {
            await getApiBase();
            if (!API_BASE) {
                return false;
            }
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(`${API_BASE.replace('/api', '')}/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response.ok;
        } catch (e) {
            clearTimeout(timeoutId);
            return false;
        }
    },

    // Setup APIs (no auth required - for initial shop bootstrap)
    setup: {
        status: () => api.get('/setup/status'),
        bootstrap: (data) => api.post('/setup/bootstrap', data),
    },

    // Authentication & User Management
    auth: {
        requestOTP: (phone) => api.post('/auth/request-otp', { phone }),
        login: (credentials) => api.post('/auth/login', credentials),
        me: () => api.get('/auth/me'),
        logout: () => {
            clearToken();
            return Promise.resolve();
        },
        // User management (ADMIN only)
        listUsers: () => api.get('/auth/users'),
        createUser: (data) => api.post('/auth/users', data),
    },

    // Invoices
    invoices: {
        list: () => api.get('/invoices'),
        get: (id) => api.get(`/invoices/${id}`),
        create: (data) => api.post('/invoices', data),
        update: (id, data) => api.put(`/invoices/${id}`, data),
        delete: (id) => api.delete(`/invoices/${id}`),
        uploadPhoto: async (id, file) => {
            if (!API_BASE) {
                await getApiBase();
                if (!API_BASE) {
                    throw new ApiError('Backend URL not configured', 0, null);
                }
            }
            const formData = new FormData();
            formData.append('photo', file);
            const token = getToken();

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS * 3); // Longer timeout for uploads

            try {
                const response = await fetch(`${API_BASE}/invoices/${id}/photos`, {
                    method: 'POST',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    body: formData,
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) throw new ApiError('Failed to upload photo', response.status);
                return response.json();
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new ApiError('Upload timed out', 0, null);
                }
                throw error;
            }
        },
    },

    // Customers
    customers: {
        list: () => api.get('/customers'),
        get: (id) => api.get(`/customers/${id}`),
        create: (data) => api.post('/customers', data),
        update: (id, data) => api.put(`/customers/${id}`, data),
        delete: (id) => api.delete(`/customers/${id}`),
    },

    // Vendors
    vendors: {
        list: () => api.get('/vendors'),
        get: (id) => api.get(`/vendors/${id}`),
        create: (data) => api.post('/vendors', data),
        update: (id, data) => api.put(`/vendors/${id}`, data),
        delete: (id) => api.delete(`/vendors/${id}`),
    },

    // Products
    products: {
        list: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return api.get(`/products${params ? `?${params}` : ''}`);
        },
        get: (id) => api.get(`/products/${id}`),
        create: (data) => api.post('/products', data),
        update: (id, data) => api.put(`/products/${id}`, data),
        delete: (id) => api.delete(`/products/${id}`),

        // Image operations - managed separately from product CRUD
        images: {
            /**
             * Upload an image to a product
             * @param {string} productId - Product ID
             * @param {File} file - Image file to upload
             * @returns {Promise<{id: string, url: string, createdAt: string}>}
             */
            upload: async (productId, file) => {
                if (!API_BASE) {
                    await getApiBase();
                    if (!API_BASE) {
                        throw new ApiError('Backend URL not configured', 0, null);
                    }
                }
                const formData = new FormData();
                formData.append('image', file); // Field name MUST be 'image' per API spec
                const token = getToken();

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS * 3); // Longer timeout for uploads

                try {
                    const response = await fetch(`${API_BASE}/products/${productId}/images`, {
                        method: 'POST',
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                        body: formData,
                        signal: controller.signal,
                    });
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new ApiError(
                            errorData.error || 'Failed to upload image',
                            response.status,
                            errorData.details
                        );
                    }
                    return response.json();
                } catch (error) {
                    clearTimeout(timeoutId);
                    if (error.name === 'AbortError') {
                        throw new ApiError('Upload timed out', 0, null);
                    }
                    throw error;
                }
            },

            /**
             * Delete an image from a product
             * @param {string} productId - Product ID
             * @param {string} imageId - Image ID to delete
             */
            delete: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
        },
    },

    // Purchases
    purchases: {
        list: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return api.get(`/purchases${params ? `?${params}` : ''}`);
        },
        get: (id) => api.get(`/purchases/${id}`),
        create: (data) => api.post('/purchases', data),
        update: (id, data) => api.put(`/purchases/${id}`, data),
        delete: (id) => api.delete(`/purchases/${id}`),
    },

    // Payments
    payments: {
        list: () => api.get('/payments'),
        listByParty: (partyId) => api.get(`/payments?partyId=${partyId}`),
        get: (id) => api.get(`/payments/${id}`),
        create: (data) => api.post('/payments', data),
        delete: (id) => api.delete(`/payments/${id}`),
    },

    // Categories & Subcategories
    categories: {
        list: () => api.get('/categories'),
        get: (id) => api.get(`/categories/${id}`),
        create: (data) => api.post('/categories', data),
        update: (id, data) => api.put(`/categories/${id}`, data),
        delete: (id) => api.delete(`/categories/${id}`),
        addSubcategory: (categoryId, data) => api.post(`/categories/${categoryId}/subcategories`, data),
        deleteSubcategory: (categoryId, subcategoryId) =>
            api.delete(`/categories/${categoryId}/subcategories/${subcategoryId}`),
    },

    // Settings
    settings: {
        get: () => api.get('/settings'),
        update: (key, value) => api.put(`/settings/${key}`, { value }),
    },

    // Attendance
    attendance: {
        login: (userId) => api.post('/attendance/login', { userId }),
        logout: (logId) => api.post('/attendance/logout', { logId }),
        getHistory: (userId, limit = 30) => api.get(`/attendance/user/${userId}?limit=${limit}`),
        getByDate: (userId, date) => api.get(`/attendance/user/${userId}/date/${date}`),
        getAllByDate: (date) => api.get(`/attendance/date/${date}`),
    },

    // Photos
    photos: {
        getUrl: (id) => `${API_BASE}/photos/${id}`,
        /**
         * Convert a relative API URL to an absolute URL
         * Handles URLs like "/api/photos/..." returned from the backend
         * @param {string} relativeUrl - Relative URL from API response
         * @returns {string} Full URL with backend host
         */
        getFullUrl: (relativeUrl) => {
            if (!relativeUrl) return '';
            // If already absolute, return as-is
            if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
                return relativeUrl;
            }
            // Get the base URL without /api suffix
            const baseHost = API_BASE ? API_BASE.replace('/api', '') : '';
            // Handle relative URLs that start with /api
            if (relativeUrl.startsWith('/api/')) {
                return `${baseHost}${relativeUrl}`;
            }
            // Handle relative URLs that start with /
            if (relativeUrl.startsWith('/')) {
                return `${baseHost}${relativeUrl}`;
            }
            return relativeUrl;
        },
    },

    // Expenses (if endpoint exists)
    expenses: {
        list: () => api.get('/expenses'),
        get: (id) => api.get(`/expenses/${id}`),
        create: (data) => api.post('/expenses', data),
        update: (id, data) => api.put(`/expenses/${id}`, data),
        delete: (id) => api.delete(`/expenses/${id}`),
    },

    // Audit logs (if endpoint exists)
    auditLogs: {
        create: (data) => api.post('/audit-logs', data),
    },
};

export default api;
