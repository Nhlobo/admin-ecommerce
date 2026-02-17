/**
 * Security Logs Panel
 * Activity and security event logging
 */

const SecurityLogsPanel = {
    async init() {
        await this.loadActivityLogs();
    },
    
    async loadActivityLogs() {
        try {
            const severity = document.getElementById('activitySeverityFilter')?.value || '';
            const data = await API.get('/admin/logs/activity', { severity });
            
            if (data.success) {
                this.renderActivityLogs(data.data || []);
            }
        } catch (error) {
            console.error('Error loading activity logs:', error);
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
            const severity = document.getElementById('securitySeverityFilter')?.value || '';
            const data = await API.get('/admin/logs/security', { severity });
            
            if (data.success) {
                this.renderSecurityEvents(data.data || []);
            }
        } catch (error) {
            console.error('Error loading security events:', error);
        }
    },
    
    renderSecurityEvents(events) {
        const tbody = document.getElementById('securityEventsBody');
        if (!tbody) return;
        
        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No security events found</td></tr>';
            return;
        }
        
        tbody.innerHTML = events.map(event => `
            <tr>
                <td>${Utils.escapeHtml(event.event_type)}</td>
                <td>${Utils.escapeHtml(event.description)}</td>
                <td>${Utils.getStatusBadge(event.severity)}</td>
                <td>${Utils.escapeHtml(event.ip_address || 'N/A')}</td>
                <td>${event.resolved ? 'Yes' : 'No'}</td>
                <td>${Utils.formatDateTime(event.created_at)}</td>
            </tr>
        `).join('');
    }
};

window.refreshActivityLogs = () => SecurityLogsPanel.loadActivityLogs();
window.refreshSecurityEvents = () => SecurityLogsPanel.loadSecurityEvents();
window.SecurityLogsPanel = SecurityLogsPanel;
