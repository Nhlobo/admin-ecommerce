/**
 * Overview Panel
 * Dashboard home panel with stats and quick actions
 */

const OverviewPanel = {
    /**
     * Initialize overview panel
     */
    async init() {
        await this.loadData();
        this.setupRefresh();
    },
    
    /**
     * Load overview data
     */
    async load() {
        try {
            const data = await API.get('/admin/dashboard/overview');
            
            if (data.success) {
                this.updateStats(data.data);
                this.updateRecentOrders(data.data.recentTransactions || []);
            }
        } catch (error) {
            console.error('Error loading overview:', error);
            Notifications.error('Failed to load dashboard overview');
        }
    },
    
    /**
     * Update stats cards
     */
    updateStats(overview) {
        // Orders today
        const ordersToday = document.getElementById('ordersToday');
        if (ordersToday) {
            ordersToday.textContent = overview.ordersToday?.count || 0;
        }
        
        // Revenue today
        const revenueToday = document.getElementById('revenueToday');
        if (revenueToday) {
            revenueToday.textContent = Utils.formatCurrency(overview.ordersToday?.revenue || 0);
        }
        
        // Pending orders
        const pendingOrders = document.getElementById('pendingOrders');
        if (pendingOrders) {
            const count = overview.pendingOrders || 0;
            pendingOrders.textContent = count;
            
            // Add alert class if more than 10 pending orders
            const card = pendingOrders.closest('.stat-card');
            if (card) {
                card.classList.toggle('alert', count > 10);
            }
        }
        
        // Low stock alerts
        const lowStockProducts = document.getElementById('lowStockProducts');
        if (lowStockProducts) {
            lowStockProducts.textContent = overview.lowStockProducts || 0;
        }
    },
    
    /**
     * Update recent orders table
     */
    updateRecentOrders(orders) {
        const tbody = document.getElementById('recentOrdersBody');
        if (!tbody) return;
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent orders</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${Utils.escapeHtml(order.order_number)}</td>
                <td>${Utils.escapeHtml(order.customer_name)}</td>
                <td>${Utils.formatCurrency(order.total_amount)}</td>
                <td>${Utils.getStatusBadge(order.status)}</td>
                <td>${Utils.formatDate(order.placed_at)}</td>
            </tr>
        `).join('');
    },
    
    /**
     * Setup auto-refresh
     */
    setupRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            this.loadData();
        }, 30000);
    },
    
    /**
     * Load data (alias for backward compatibility)
     */
    async loadData() {
        await this.load();
    }
};

// Export
if (typeof window !== 'undefined') {
    window.OverviewPanel = OverviewPanel;
}
