/**
 * Overview Panel
 * Dashboard home panel with stats, charts, and quick actions
 */

const OverviewPanel = {
    charts: {},
    
    /**
     * Initialize overview panel
     */
    async init() {
        await this.loadData();
        await this.loadChartData();
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
     * Load chart data
     */
    async loadChartData() {
        try {
            // Load revenue chart data
            await this.loadRevenueChart();
            
            // Load top products chart
            await this.loadTopProductsChart();
            
            // Load sales by category chart
            await this.loadSalesByCategoryChart();
            
            // Load customer metrics
            await this.loadCustomerMetricsChart();
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    },
    
    /**
     * Load revenue trend chart (last 30 days)
     */
    async loadRevenueChart() {
        try {
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.revenueChart, {
                days: 30
            });
            
            if (data.success && data.data) {
                this.renderRevenueChart(data.data);
            }
        } catch (error) {
            console.error('Error loading revenue chart:', error);
        }
    },
    
    /**
     * Render revenue chart
     */
    renderRevenueChart(data) {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: 'Revenue',
                    data: data.values || [],
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Revenue: ' + Utils.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Load top products chart
     */
    async loadTopProductsChart() {
        try {
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.topProducts, {
                limit: 10
            });
            
            if (data.success && data.data) {
                this.renderTopProductsChart(data.data);
            }
        } catch (error) {
            console.error('Error loading top products chart:', error);
        }
    },
    
    /**
     * Render top products chart
     */
    renderTopProductsChart(data) {
        const canvas = document.getElementById('topProductsChart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.topProducts) {
            this.charts.topProducts.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.topProducts = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: [{
                    label: 'Revenue',
                    data: data.values || [],
                    backgroundColor: '#667eea',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Revenue: ' + Utils.formatCurrency(context.parsed.x);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Load sales by category chart
     */
    async loadSalesByCategoryChart() {
        try {
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.salesByCategory);
            
            if (data.success && data.data) {
                this.renderSalesByCategoryChart(data.data);
            }
        } catch (error) {
            console.error('Error loading sales by category chart:', error);
        }
    },
    
    /**
     * Render sales by category pie chart
     */
    renderSalesByCategoryChart(data) {
        const canvas = document.getElementById('salesByCategoryChart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.salesByCategory) {
            this.charts.salesByCategory.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.salesByCategory = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels || [],
                datasets: [{
                    data: data.values || [],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#4facfe',
                        '#43e97b'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = Utils.formatCurrency(context.parsed);
                                return label + ': ' + value;
                            }
                        }
                    }
                }
            }
        });
    },
    
    /**
     * Load customer metrics chart
     */
    async loadCustomerMetricsChart() {
        try {
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.customerMetrics);
            
            if (data.success && data.data) {
                this.renderCustomerMetricsChart(data.data);
            }
        } catch (error) {
            console.error('Error loading customer metrics chart:', error);
        }
    },
    
    /**
     * Render customer metrics chart
     */
    renderCustomerMetricsChart(data) {
        const canvas = document.getElementById('customerMetricsChart');
        if (!canvas) return;
        
        // Destroy existing chart
        if (this.charts.customerMetrics) {
            this.charts.customerMetrics.destroy();
        }
        
        const ctx = canvas.getContext('2d');
        this.charts.customerMetrics = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: [
                    {
                        label: 'New Customers',
                        data: data.newCustomers || [],
                        backgroundColor: '#43e97b'
                    },
                    {
                        label: 'Returning Customers',
                        data: data.returningCustomers || [],
                        backgroundColor: '#4facfe'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
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
        // Refresh every 5 minutes
        setInterval(() => {
            this.loadData();
            this.loadChartData();
        }, 300000);
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

