/**
 * API Helper Module
 * Centralized API calls with authentication and error handling
 */

const API = {
    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint (e.g., '/admin/orders')
     * @param {Object} options - Fetch options (method, body, etc.)
     * @returns {Promise<Object>} - Response data
     */
    async request(endpoint, options = {}) {
        const token = localStorage.getItem(ADMIN_CONFIG.TOKEN_KEY) || 
                     sessionStorage.getItem(ADMIN_CONFIG.TOKEN_KEY);
        
        if (!token) {
            window.location.href = '/login';
            throw new Error('No authentication token found');
        }
        
        const url = getApiUrl(getAdminApiEndpoint(endpoint));
        
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
            const response = await fetchWithRetry(url, mergedOptions, {
                retries: 2,
                retryDelayMs: 2000,
                timeoutMs: 90000
            });
            
            // Handle authentication errors
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem(ADMIN_CONFIG.TOKEN_KEY);
                localStorage.removeItem(ADMIN_CONFIG.ADMIN_INFO_KEY);
                sessionStorage.removeItem(ADMIN_CONFIG.TOKEN_KEY);
                sessionStorage.removeItem(ADMIN_CONFIG.ADMIN_INFO_KEY);
                window.location.href = '/login';
                throw new Error('Unauthorized');
            }
            
            const data = await response.json().catch(() => ({}));
            
            if (!response.ok) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },
    
    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },
    
    /**
     * POST request
     */
    async post(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },
    
    /**
     * PUT request
     */
    async put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },
    
    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.API = API;
}
