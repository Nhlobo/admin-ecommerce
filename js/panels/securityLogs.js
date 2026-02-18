/**
 * Security Logs Panel
 * Activity and security event logging with enhanced monitoring
 */

const SecurityLogsPanel = {
    currentFilters: {
        activity: {},
        security: {}
    },
    
    async init() {
        this.setupEventListeners();
        await this.loadActivityLogs();
        await this.loadSecuritySummary();
    },
    
    setupEventListeners() {
        // Activity severity filter
        const activitySeverityFilter = document.getElementById('activitySeverityFilter');
        if (activitySeverityFilter) {
            activitySeverityFilter.addEventListener('change', () => {
                this.currentFilters.activity.severity = activitySeverityFilter.value;
                this.loadActivityLogs();
            });
        }
        
        // Security severity filter
        const securitySeverityFilter = document.getElementById('securitySeverityFilter');
        if (securitySeverityFilter) {
            securitySeverityFilter.addEventListener('change', () => {
                this.currentFilters.security.severity = securitySeverityFilter.value;
                this.loadSecurityEvents();
            });
        }
    },
    
    async loadActivityLogs() {
        try {
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.activityLogs, this.currentFilters.activity);
            
            if (data.success) {
                this.renderActivityLogs(data.data || []);
            }
        } catch (error) {
            console.error('Error loading activity logs:', error);
            Notifications.error('Failed to load activity logs');
        }
    },
    
    renderActivityLogs(logs) {
        const tbody = document.getElementById('activityLogsBody');
        if (!tbody) return;
        
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No activity logs found</td></tr>';
            return;
        }
        
        tbody.innerHTML = logs.map(log => `
            <tr>
                <td>${Utils.escapeHtml(log.admin_name)}</td>
                <td>${Utils.escapeHtml(log.action)}</td>
                <td>${Utils.escapeHtml(log.entity_type || 'N/A')}</td>
                <td>${Utils.escapeHtml(log.ip_address)}</td>
                <td>${Utils.getStatusBadge(log.severity)}</td>
                <td>${Utils.formatDateTime(log.created_at)}</td>
            </tr>
        `).join('');
    },
    
    async loadSecurityEvents() {
        try {
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.securityEvents, this.currentFilters.security);
            
            if (data.success) {
                this.renderSecurityEvents(data.data || []);
            }
        } catch (error) {
            console.error('Error loading security events:', error);
            Notifications.error('Failed to load security events');
        }
    },
    
    renderSecurityEvents(events) {
        const tbody = document.getElementById('securityEventsBody');
        if (!tbody) return;
        
        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No security events found</td></tr>';
            return;
        }
        
        tbody.innerHTML = events.map(event => `
            <tr>
                <td>${Utils.escapeHtml(event.event_type)}</td>
                <td>${Utils.escapeHtml(event.description)}</td>
                <td>${Utils.getStatusBadge(event.severity)}</td>
                <td>${Utils.escapeHtml(event.ip_address || 'N/A')}</td>
                <td>${event.resolved ? '<span class="status-badge success">Yes</span>' : '<span class="status-badge warning">No</span>'}</td>
                <td>${Utils.formatDateTime(event.created_at)}</td>
                <td>
                    ${!event.resolved && AdminAuth.hasPermission('update_security') ? `
                    <button class="btn btn-sm btn-success" onclick="SecurityLogsPanel.resolveSecurityEvent('${event.id}')">
                        <i class="fas fa-check"></i> Resolve
                    </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * Load security summary statistics
     */
    async loadSecuritySummary() {
        try {
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.securityEvents + '/summary');
            
            if (data.success && data.summary) {
                this.renderSecuritySummary(data.summary);
            }
        } catch (error) {
            console.error('Error loading security summary:', error);
        }
    },
    
    /**
     * Render security summary
     */
    renderSecuritySummary(summary) {
        const summaryContainer = document.getElementById('securitySummaryStats');
        if (!summaryContainer) return;
        
        summaryContainer.innerHTML = `
            <div class="security-stat-card">
                <div class="stat-icon orange">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-info">
                    <h3>${summary.failedLoginAttempts || 0}</h3>
                    <p>Failed Login Attempts (24h)</p>
                </div>
            </div>
            <div class="security-stat-card">
                <div class="stat-icon red">
                    <i class="fas fa-ban"></i>
                </div>
                <div class="stat-info">
                    <h3>${summary.blockedIPs || 0}</h3>
                    <p>Blocked IPs</p>
                </div>
            </div>
            <div class="security-stat-card">
                <div class="stat-icon blue">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="stat-info">
                    <h3>${summary.activeSessions || 0}</h3>
                    <p>Active Sessions</p>
                </div>
            </div>
            <div class="security-stat-card">
                <div class="stat-icon green">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <h3>${summary.resolvedEvents || 0}</h3>
                    <p>Resolved Events (7d)</p>
                </div>
            </div>
        `;
    },
    
    /**
     * Resolve security event
     */
    async resolveSecurityEvent(eventId) {
        if (!confirm('Mark this security event as resolved?')) {
            return;
        }
        
        try {
            const data = await API.post(`${ADMIN_CONFIG.ENDPOINTS.securityEvents}/${eventId}/resolve`);
            
            if (data.success) {
                Notifications.success('Security event resolved');
                await this.loadSecurityEvents();
                await this.loadSecuritySummary();
            } else {
                Notifications.error(data.message || 'Failed to resolve event');
            }
        } catch (error) {
            console.error('Error resolving security event:', error);
            Notifications.error('Failed to resolve security event');
        }
    },
    
    /**
     * Export activity logs to CSV
     */
    async exportActivityLogs() {
        try {
            Notifications.info('Generating export...');
            
            const params = {
                ...this.currentFilters.activity,
                format: 'csv'
            };
            
            const response = await fetch(
                getApiUrl(ADMIN_CONFIG.ENDPOINTS.activityLogs + '/export') + '?' + new URLSearchParams(params),
                {
                    headers: {
                        'Authorization': `Bearer ${AdminAuth.getToken()}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to export logs');
            }
            
            // Download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            Notifications.success('Logs exported successfully');
        } catch (error) {
            console.error('Error exporting logs:', error);
            Notifications.error('Failed to export logs');
        }
    },
    
    /**
     * Export security events to CSV
     */
    async exportSecurityEvents() {
        try {
            Notifications.info('Generating export...');
            
            const params = {
                ...this.currentFilters.security,
                format: 'csv'
            };
            
            const response = await fetch(
                getApiUrl(ADMIN_CONFIG.ENDPOINTS.securityEvents + '/export') + '?' + new URLSearchParams(params),
                {
                    headers: {
                        'Authorization': `Bearer ${AdminAuth.getToken()}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to export events');
            }
            
            // Download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `security_events_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            Notifications.success('Events exported successfully');
        } catch (error) {
            console.error('Error exporting events:', error);
            Notifications.error('Failed to export events');
        }
    }
};

window.refreshActivityLogs = () => SecurityLogsPanel.loadActivityLogs();
window.refreshSecurityEvents = () => SecurityLogsPanel.loadSecurityEvents();
window.exportActivityLogs = () => SecurityLogsPanel.exportActivityLogs();
window.exportSecurityEvents = () => SecurityLogsPanel.exportSecurityEvents();
window.SecurityLogsPanel = SecurityLogsPanel;

