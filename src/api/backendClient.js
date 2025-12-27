/**
 * Centralized Backend API Client
 * 
 * All data operations must go through this layer.
 * Frontend must never cache backend data as authoritative.
 */

import { Preferences } from '@capacitor/preferences';

/**
 * Centralized Backend API Client
 * 
 * All data operations must go through this layer.
 * Frontend must never cache backend data as authoritative.
 */

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || null;
let API_BASE = DEFAULT_API_BASE;
let isConfigured = !!DEFAULT_API_BASE;

// Connection Listeners
const connectionListeners = new Set();
const notifyConnectionLost = () => {
    connectionListeners.forEach(l => l());
};

export const onConnectionError = (callback) => {
    connectionListeners.add(callback);
    return () => connectionListeners.delete(callback);
};

// Configuration Management
export const getApiBase = async () => {
    const { value } = await Preferences.get({ key: 'api_base_url' });
    if (value) {
        API_BASE = value;
        isConfigured = true;
    } else {
        API_BASE = DEFAULT_API_BASE;
        isConfigured = !!DEFAULT_API_BASE;
    }
    return API_BASE;
};

export const setApiBase = async (url) => {
    // Normalization: trim, remove trailing slash
    let cleanUrl = url.trim();
    if (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1);
    }
    // Ensure protocol
    if (!/^https?:\/\//i.test(cleanUrl)) {
        throw new Error('Invalid URL protocol');
    }

    await Preferences.set({ key: 'api_base_url', value: cleanUrl });
    API_BASE = cleanUrl;
    isConfigured = true;
};

export const isBackendConfigured = () => isConfigured;

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

// Generate idempotency keys natively
const generateRequestId = () => crypto.randomUUID();

/**
 * Core request function with error handling
 */
async function request(method, endpoint, data = null, options = {}) {
    // Ensure we have the latest config if not yet loaded (though AuthWrapper should handle this)
    // For safety, we rely on API_BASE variable being set by initApi or getApiBase

    if (!API_BASE) {
        throw new Error('Backend URL not configured');
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

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized - clear token and throw error
        // AuthWrapper will automatically show the login flow when user is not authenticated
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
        if (error instanceof ApiError) {
            throw error;
        }

        // Notify connection loss on network errors
        // Distinguish between network error and other errors?
        // fetch throws TypeError on network failure
        console.error('API Request Failed:', error);
        notifyConnectionLost();

        // Network error or other fetch error
        throw new ApiError(
            error.message || 'Network error - backend may be unavailable',
            0,
            null
        );
    }
}

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
 * API Client with all endpoints
 */
export const api = {
    // Utilities
    init: getApiBase,
    setApiBase,
    onConnectionError,

    // Raw request methods
    get: (endpoint) => request('GET', endpoint),
    post: (endpoint, data, options) => request('POST', endpoint, data, options),
    put: (endpoint, data, options) => request('PUT', endpoint, data, options),
    patch: (endpoint, data, options) => request('PATCH', endpoint, data, options),
    delete: (endpoint) => request('DELETE', endpoint),

    // Health check - checks CURRENT base URL
    health: () => fetch(`${API_BASE.replace('/api', '')}/health`).then(r => r.ok),

    // Authentication
    auth: {
        requestOTP: (phone) => api.post('/auth/request-otp', { phone }),
        login: (credentials) => api.post('/auth/login', credentials),
        me: () => api.get('/auth/me'),
        logout: () => {
            clearToken();
            return Promise.resolve();
        },
    },

    // Invoices
    invoices: {
        list: () => api.get('/invoices'),
        get: (id) => api.get(`/invoices/${id}`),
        create: (data) => api.post('/invoices', data),
        update: (id, data) => api.put(`/invoices/${id}`, data),
        delete: (id) => api.delete(`/invoices/${id}`),
        uploadPhoto: async (id, file) => {
            const formData = new FormData();
            formData.append('photo', file);
            const token = getToken();
            const response = await fetch(`${API_BASE}/invoices/${id}/photos`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData,
            });
            if (!response.ok) throw new ApiError('Failed to upload photo', response.status);
            return response.json();
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
                const formData = new FormData();
                formData.append('image', file); // Field name MUST be 'image' per API spec
                const token = getToken();
                const response = await fetch(`${API_BASE}/products/${productId}/images`, {
                    method: 'POST',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    body: formData,
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new ApiError(
                        errorData.error || 'Failed to upload image',
                        response.status,
                        errorData.details
                    );
                }
                return response.json();
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
