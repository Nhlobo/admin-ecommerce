/**
 * Admin Authentication Module
 * Enhanced authentication with role-based access control
 */

const AdminAuth = {
    /**
     * Get current admin info
     */
    getAdminInfo() {
        const stored = localStorage.getItem(ADMIN_CONFIG.ADMIN_INFO_KEY) ||
                      sessionStorage.getItem(ADMIN_CONFIG.ADMIN_INFO_KEY);
        return stored ? JSON.parse(stored) : null;
    },
    
    /**
     * Get admin token
     */
    getToken() {
        return localStorage.getItem(ADMIN_CONFIG.TOKEN_KEY) ||
               sessionStorage.getItem(ADMIN_CONFIG.TOKEN_KEY);
    },
    
    /**
     * Check if admin is authenticated
     */
    isAuthenticated() {
        return !!this.getToken();
    },
    
    /**
     * Get admin role
     */
    getRole() {
        const adminInfo = this.getAdminInfo();
        return adminInfo ? adminInfo.role : null;
    },
    
    /**
     * Check if admin has specific role
     */
    hasRole(role) {
        return this.getRole() === role;
    },
    
    /**
     * Check if admin is super admin
     */
    isSuperAdmin() {
        return this.hasRole('super_admin');
    },
    
    /**
     * Check if admin is staff
     */
    isStaff() {
        return this.hasRole('staff');
    },
    
    /**
     * Check if admin has permission
     * @param {string} permission - Permission to check (e.g., 'delete_product', 'view_logs')
     */
    hasPermission(permission) {
        // Super admin has all permissions
        if (this.isSuperAdmin()) {
            return true;
        }
        
        // Staff permissions
        const staffPermissions = [
            'view_orders',
            'update_orders',
            'view_products',
            'update_products',
            'update_inventory',
            'view_customers',
            'view_payments',
            'process_returns',
            'view_returns',
            'view_discounts'
        ];
        
        if (this.isStaff()) {
            return staffPermissions.includes(permission);
        }
        
        return false;
    },
    
    /**
     * Logout admin
     */
    async logout() {
        try {
            // Call backend logout endpoint
            await API.post('/admin/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all auth data
            localStorage.removeItem(ADMIN_CONFIG.TOKEN_KEY);
            localStorage.removeItem(ADMIN_CONFIG.ADMIN_INFO_KEY);
            sessionStorage.removeItem(ADMIN_CONFIG.TOKEN_KEY);
            sessionStorage.removeItem(ADMIN_CONFIG.ADMIN_INFO_KEY);
            
            // Redirect to login
            window.location.href = '/login';
        }
    },
    
    /**
     * Verify session
     */
    async verifySession() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        
        try {
            const response = await API.get('/admin/verify');
            return response.success;
        } catch (error) {
            console.error('Session verification failed:', error);
            window.location.href = '/login';
            return false;
        }
    },
    
    /**
     * Setup session timeout
     * Auto-logout after 30 minutes of inactivity
     */
    setupSessionTimeout() {
        let timeoutId;
        const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
        
        const resetTimeout = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                Notifications.warning('Session expired due to inactivity');
                this.logout();
            }, TIMEOUT_DURATION);
        };
        
        // Reset timeout on user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout, true);
        });
        
        // Initial timeout
        resetTimeout();
    },
    
    /**
     * Apply role-based UI restrictions
     */
    applyRoleRestrictions() {
        if (this.isSuperAdmin()) {
            // Super admin sees everything
            return;
        }
        
        // Hide elements based on role
        const restrictedElements = {
            staff: [
                '.delete-product-btn',
                '.delete-discount-btn',
                '.delete-customer-btn',
                '[data-panel="logs"]',
                '[data-permission="super_admin"]'
            ]
        };
        
        const role = this.getRole();
        const elementsToHide = restrictedElements[role] || [];
        
        elementsToHide.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'none';
            });
        });
    },
    
    /**
     * Check element permission
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} - Whether element is accessible
     */
    checkElementPermission(element) {
        const permission = element.dataset.permission;
        if (!permission) return true;
        
        return this.hasPermission(permission);
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AdminAuth = AdminAuth;
}
