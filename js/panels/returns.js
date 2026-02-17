/**
 * Returns Panel
 * Returns and refunds management
 */

const ReturnsPanel = {
    async init() {
        this.setupEventListeners();
        await this.load();
    },
    
    setupEventListeners() {
        const statusFilter = document.getElementById('returnStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.load();
            });
        }
    },
    
    async load() {
        try {
            const status = document.getElementById('returnStatusFilter')?.value || '';
            const data = await API.get('/admin/returns', { status });
            
            if (data.success) {
                this.renderReturns(data.data || []);
            }
        } catch (error) {
            console.error('Error loading returns:', error);
            Notifications.error('Failed to load returns');
        }
    },
    
    renderReturns(returns) {
        const tbody = document.getElementById('returnsTableBody');
        if (!tbody) return;
        
        if (returns.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No returns found</td></tr>';
            return;
        }
        
        tbody.innerHTML = returns.map(returnItem => `
            <tr>
                <td>${Utils.escapeHtml(returnItem.return_number)}</td>
                <td>${Utils.escapeHtml(returnItem.order_number)}</td>
                <td>${Utils.escapeHtml(returnItem.customer_name || 'N/A')}</td>
                <td>${Utils.escapeHtml(returnItem.reason)}</td>
                <td>${Utils.getStatusBadge(returnItem.status)}</td>
                <td>${Utils.formatDate(returnItem.requested_at)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="ReturnsPanel.viewReturn('${returnItem.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    async viewReturn(returnId) {
        Notifications.info('Return details view coming soon');
    },
    
    async refresh() {
        await this.load();
        Notifications.success('Returns refreshed');
    }
};

window.refreshReturns = () => ReturnsPanel.refresh();
window.viewReturn = (id) => ReturnsPanel.viewReturn(id);
window.ReturnsPanel = ReturnsPanel;
