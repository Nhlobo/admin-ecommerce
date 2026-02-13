/**
 * Admin Dashboard Configuration
 * Runtime backend URL can be injected by server via /js/runtime-config.js
 */

function normalizeBaseUrl(url) {
    if (!url || typeof url !== 'string') return '';
    return url.replace(/\/+$/, '');
}

const runtimeApiBaseUrl = normalizeBaseUrl(window.__ADMIN_RUNTIME_CONFIG?.apiBaseUrl);
const defaultApiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://backend-ecommerce-1-xp4b.onrender.com';

const ADMIN_CONFIG = {
    API_BASE_URL: runtimeApiBaseUrl || defaultApiBaseUrl,

    ENDPOINTS: {
        login: '/api/admin/login',
        logout: '/api/admin/logout',
        verify: '/api/admin/verify',

        // Dashboard
        dashboard: '/api/admin/dashboard',
        metrics: '/api/admin/metrics',

        // Orders
        orders: '/api/admin/orders',
        orderById: (id) => `/api/admin/orders/${id}`,
        updateOrder: (id) => `/api/admin/orders/${id}`,

        // Payments
        payments: '/api/admin/payments',

        // Customers
        customers: '/api/admin/customers',
        customerById: (id) => `/api/admin/customers/${id}`,

        // Products
        products: '/api/admin/products',
        productById: (id) => `/api/admin/products/${id}`,

        // Discounts
        discounts: '/api/admin/discounts',
        discountById: (id) => `/api/admin/discounts/${id}`,

        // Returns
        returns: '/api/admin/returns',
        returnById: (id) => `/api/admin/returns/${id}`,

        // Reports
        reports: '/api/admin/reports',
        salesReport: '/api/admin/reports/sales',
        analytics: '/api/admin/reports/analytics',

        // Compliance
        vatRecords: '/api/admin/compliance/vat',
        activityLogs: '/api/admin/compliance/activity-logs',

        // Security
        securityEvents: '/api/admin/security/events',
        securityLogs: '/api/admin/security/logs'
    },

    TOKEN_KEY: 'adminToken',
    ADMIN_INFO_KEY: 'adminInfo',
    REQUEST_TIMEOUT: 30000,
    WAKEUP_MAX_ATTEMPTS: 5,
    WAKEUP_RETRY_DELAY_MS: 2500
};

function getApiUrl(endpoint) {
    return ADMIN_CONFIG.API_BASE_URL + endpoint;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForBackendWakeup() {
    const wakeupEndpoint = getApiUrl(ADMIN_CONFIG.ENDPOINTS.verify);

    for (let attempt = 1; attempt <= ADMIN_CONFIG.WAKEUP_MAX_ATTEMPTS; attempt += 1) {
        try {
            // verify usually returns 401 without token, which still confirms backend is awake
            const response = await fetch(wakeupEndpoint, { method: 'GET' });
            if (response.ok || response.status === 401 || response.status === 403) {
                return true;
            }
        } catch (error) {
            // keep retrying for sleeping server startup
        }

        if (attempt < ADMIN_CONFIG.WAKEUP_MAX_ATTEMPTS) {
            await sleep(ADMIN_CONFIG.WAKEUP_RETRY_DELAY_MS);
        }
    }

    return false;
}
