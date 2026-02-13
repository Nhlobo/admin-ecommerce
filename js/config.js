/**
 * Admin Dashboard Configuration
 * Configure the backend API URL here
 */

// Backend API Configuration
// For development: http://localhost:3000
// For production: https://your-backend-url.onrender.com
const ADMIN_CONFIG = {
    // Change this to your deployed backend URL
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'  // Development
        : 'https://backend-ecommerce-1-xp4b.onrender.com',  // Production - UPDATED!
    
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
        securityLogs: '/api/admin/security/logs'
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

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return ADMIN_CONFIG.API_BASE_URL + endpoint;
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
    module.exports = { ADMIN_CONFIG, getApiUrl, authenticatedFetch };
}