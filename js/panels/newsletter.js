/**
 * Newsletter Panel
 * Manage newsletter subscribers and campaigns
 */

const NewsletterPanel = {
    currentPage: 1,
    pageSize: 20,
    currentFilters: {
        search: '',
        status: ''
    },
    
    /**
     * Initialize newsletter panel
     */
    async init() {
        this.setupEventListeners();
        await this.load();
        await this.loadStatistics();
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search by email
        const searchInput = document.getElementById('newsletterSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.currentFilters.search = searchInput.value;
                this.currentPage = 1;
                this.load();
            }, 500));
        }
        
        // Status filter
        const statusFilter = document.getElementById('newsletterStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentFilters.status = statusFilter.value;
                this.currentPage = 1;
                this.load();
            });
        }
    },
    
    /**
     * Load subscribers data
     */
    async load() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...this.currentFilters
            };
            
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.newsletterSubscribers, params);
            
            if (data.success) {
                this.renderSubscribers(data.data || []);
            }
        } catch (error) {
            console.error('Error loading subscribers:', error);
            Notifications.error('Failed to load subscribers');
        }
    },
    
    /**
     * Render subscribers table
     */
    renderSubscribers(subscribers) {
        const tbody = document.getElementById('subscribersTableBody');
        if (!tbody) return;
        
        if (subscribers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No subscribers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = subscribers.map(subscriber => {
            const statusClass = subscriber.is_verified ? 'success' : 'warning';
            const statusText = subscriber.is_verified ? 'Verified' : 'Unverified';
            
            return `
            <tr>
                <td>${Utils.escapeHtml(subscriber.email)}</td>
                <td>${Utils.capitalize(subscriber.source || 'Unknown')}</td>
                <td>${Utils.getStatusBadge(statusClass, statusText)}</td>
                <td>${Utils.formatDate(subscriber.subscribed_at)}</td>
                <td>${subscriber.last_email_sent ? Utils.formatDate(subscriber.last_email_sent) : 'Never'}</td>
                <td>
                    ${AdminAuth.hasPermission('view_newsletter') ? `
                    <button class="btn btn-sm btn-danger" 
                            onclick="NewsletterPanel.unsubscribeUser('${subscriber.id}')"
                            title="Unsubscribe">
                        <i class="fas fa-user-slash"></i> Unsubscribe
                    </button>
                    ` : ''}
                </td>
            </tr>
            `;
        }).join('');
    },
    
    /**
     * Load newsletter statistics
     */
    async loadStatistics() {
        try {
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.newsletterSubscribers + '/stats');
            
            if (data.success && data.stats) {
                this.renderStatistics(data.stats);
            }
        } catch (error) {
            console.error('Error loading newsletter statistics:', error);
        }
    },
    
    /**
     * Render statistics
     */
    renderStatistics(stats) {
        const statsContainer = document.getElementById('newsletterStats');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="newsletter-stat-card">
                <div class="stat-icon blue">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-info">
                    <h3>${stats.totalSubscribers || 0}</h3>
                    <p>Total Subscribers</p>
                </div>
            </div>
            <div class="newsletter-stat-card">
                <div class="stat-icon green">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>${stats.verifiedSubscribers || 0}</h3>
                    <p>Verified</p>
                </div>
            </div>
            <div class="newsletter-stat-card">
                <div class="stat-icon orange">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-info">
                    <h3>${stats.growthRate || 0}%</h3>
                    <p>Growth Rate (30d)</p>
                </div>
            </div>
            <div class="newsletter-stat-card">
                <div class="stat-icon purple">
                    <i class="fas fa-envelope"></i>
                </div>
                <div class="stat-info">
                    <h3>${stats.emailsSentThisMonth || 0}</h3>
                    <p>Emails Sent (This Month)</p>
                </div>
            </div>
        `;
    },
    
    /**
     * Unsubscribe a user
     */
    async unsubscribeUser(subscriberId) {
        if (!confirm('Are you sure you want to unsubscribe this user?')) {
            return;
        }
        
        try {
            const endpoint = ADMIN_CONFIG.ENDPOINTS.unsubscribeUser(subscriberId);
            const data = await API.post(endpoint);
            
            if (data.success) {
                Notifications.success('User unsubscribed successfully');
                await this.load();
                await this.loadStatistics();
            } else {
                Notifications.error(data.message || 'Failed to unsubscribe user');
            }
        } catch (error) {
            console.error('Error unsubscribing user:', error);
            Notifications.error('Failed to unsubscribe user');
        }
    },
    
    /**
     * Export subscribers to CSV
     */
    async exportSubscribers(format = 'csv') {
        try {
            Notifications.info('Generating export...');
            
            const params = {
                ...this.currentFilters,
                format: format
            };
            
            const response = await fetch(
                getApiUrl(ADMIN_CONFIG.ENDPOINTS.exportSubscribers) + '?' + new URLSearchParams(params),
                {
                    headers: {
                        'Authorization': `Bearer ${AdminAuth.getToken()}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to export subscribers');
            }
            
            // Download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            Notifications.success('Subscribers exported successfully');
        } catch (error) {
            console.error('Error exporting subscribers:', error);
            Notifications.error('Failed to export subscribers');
        }
    }
};

// Export functions
window.NewsletterPanel = NewsletterPanel;
window.exportNewsletterCSV = () => NewsletterPanel.exportSubscribers('csv');
window.exportNewsletterMailchimp = () => NewsletterPanel.exportSubscribers('mailchimp');
