/**
 * Utility Functions
 * Helper functions for formatting, data manipulation, etc.
 */

const Utils = {
    /**
     * Format currency (ZAR)
     */
    formatCurrency(amount) {
        return `R${parseFloat(amount).toFixed(2)}`;
    },
    
    /**
     * Format date
     */
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    /**
     * Format date and time
     */
    formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Capitalize first letter
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    /**
     * Truncate text
     */
    truncate(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    /**
     * Get status badge HTML
     */
    getStatusBadge(status, text = null) {
        const displayText = text || this.capitalize(status);
        return `<span class="status-badge status-${status}">${displayText}</span>`;
    },
    
    /**
     * Debounce function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Parse query parameters
     */
    parseQueryParams(queryString) {
        const params = new URLSearchParams(queryString);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
    
    /**
     * Download data as CSV
     */
    downloadCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) {
            Notifications.error('No data to export');
            return;
        }
        
        // Get headers from first object
        const headers = Object.keys(data[0]);
        
        // Create CSV content
        let csv = headers.join(',') + '\n';
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape commas and quotes
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csv += values.join(',') + '\n';
        });
        
        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Check if low stock
     */
    isLowStock(quantity, threshold = 5) {
        return quantity < threshold;
    },
    
    /**
     * Format phone number
     */
    formatPhone(phone) {
        if (!phone) return 'N/A';
        // South African format: +27 XX XXX XXXX
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `+27 ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }
        return phone;
    },
    
    /**
     * Calculate percentage
     */
    calculatePercentage(value, total) {
        if (!total || total === 0) return 0;
        return ((value / total) * 100).toFixed(2);
    },
    
    /**
     * Sort array by key
     */
    sortBy(array, key, ascending = true) {
        return array.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
