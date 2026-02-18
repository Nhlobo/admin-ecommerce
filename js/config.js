/**
 * Admin Dashboard Configuration
 * Configure the backend API URL here
 * 
 * IMPORTANT: Update the production API URL before deployment!
 * Replace 'https://backend-ecommerce-3-2jsk.onrender.com' with your actual backend URL
 */

// Backend API Configuration
// For development: http://localhost:3000
// For production: Update the URL below to match your deployed backend
const ADMIN_CONFIG = {
    API_PREFIX: '/api',
    
    // ⚠️ CONFIGURATION REQUIRED: Update this URL to your deployed backend
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'  // Development
        : 'https://backend-ecommerce-3-2jsk.onrender.com',  // Production - UPDATE THIS!
    
    // API Endpoints
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
        securityLogs: '/api/admin/security/logs',
        
        // Reviews
        adminReviews: '/api/admin/reviews',
        approveReview: (id) => `/api/admin/reviews/${id}/approve`,
        rejectReview: (id) => `/api/admin/reviews/${id}/reject`,
        flagReview: (id) => `/api/admin/reviews/${id}/flag`,
        
        // Bulk operations
        exportProducts: '/api/admin/products/export',
        importProducts: '/api/admin/products/import',
        exportOrders: '/api/admin/orders/export',
        exportSubscribers: '/api/admin/newsletter/export',
        bulkUpdateStock: '/api/admin/products/bulk-stock',
        
        // Analytics
        revenueChart: '/api/admin/analytics/revenue',
        topProducts: '/api/admin/analytics/top-products',
        salesByCategory: '/api/admin/analytics/sales-by-category',
        customerMetrics: '/api/admin/analytics/customer-metrics',
        
        // Newsletter
        newsletterSubscribers: '/api/admin/newsletter/subscribers',
        unsubscribeUser: (id) => `/api/admin/newsletter/${id}/unsubscribe`,
        
        // VAT & Compliance
        vatReport: '/api/admin/compliance/vat-report',
        
        // Email Settings
        emailSettings: '/api/admin/settings/email',
        testEmail: '/api/admin/settings/email/test',
        
        // Inventory
        stockHistory: '/api/admin/inventory/stock-history',
        stockAdjustment: '/api/admin/inventory/adjust',
        reorderAlerts: '/api/admin/inventory/reorder-alerts'
    },
    
    // Application Settings
    TOKEN_KEY: 'adminToken',
    ADMIN_INFO_KEY: 'adminInfo',
    TOKEN_EXPIRES_HOURS: 24,
    
    // Request Configuration
    REQUEST_TIMEOUT: 30000, // 30 seconds
    
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
};

// Log backend URL for verification
console.log('🔗 Admin Dashboard connecting to backend:', ADMIN_CONFIG.API_BASE_URL);

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return ADMIN_CONFIG.API_BASE_URL + endpoint;
}

function getAdminApiEndpoint(endpoint) {
    if (!endpoint) return ADMIN_CONFIG.API_PREFIX;
    if (endpoint.startsWith(`${ADMIN_CONFIG.API_PREFIX}/`)) return endpoint;
    if (endpoint.startsWith('/')) return `${ADMIN_CONFIG.API_PREFIX}${endpoint}`;
    return `${ADMIN_CONFIG.API_PREFIX}/${endpoint}`;
}

async function fetchWithRetry(url, options = {}, retryConfig = {}) {
    const MAX_RETRY_DELAY_MS = 10000;
    const {
        retries = 3, // Increase default retries
        retryDelayMs: initialRetryDelayMs = 3000, // Longer delay for Render wakeup
        timeoutMs = 90000
    } = retryConfig;

    let lastError;
    let retryDelayMs = initialRetryDelayMs;

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            lastError = error;
            
            // Don't retry on client-side errors or auth failures
            if (error.name !== 'AbortError' && !error.message.includes('timeout')) {
                throw error;
            }
            
            if (attempt < retries) {
                console.log(`Retry attempt ${attempt + 1}/${retries} after ${retryDelayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelayMs));
                // Increase delay for subsequent attempts (exponential backoff)
                retryDelayMs = Math.min(retryDelayMs * 1.5, MAX_RETRY_DELAY_MS);
            }
        }
    }
    
    throw lastError || new Error('Failed to connect after multiple retries');
}

// Helper function for authenticated fetch
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem(ADMIN_CONFIG.TOKEN_KEY);
    
    if (!token) {
        window.location.href = '/login';
        throw new Error('No authentication token found');
    }
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }; 
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        // If unauthorized, redirect to login
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem(ADMIN_CONFIG.TOKEN_KEY);
            localStorage.removeItem(ADMIN_CONFIG.ADMIN_INFO_KEY);
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        
        return response;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Export config (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ADMIN_CONFIG,
        getApiUrl,
        getAdminApiEndpoint,
        fetchWithRetry,
        authenticatedFetch
    };
}
