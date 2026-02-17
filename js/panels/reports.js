/**
 * Reports Panel
 * Analytics and reporting
 */

const ReportsPanel = {
    async init() {
        // Reports are generated on-demand
    },
    
    async generateSalesReport() {
        const startDate = document.getElementById('salesStartDate')?.value;
        const endDate = document.getElementById('salesEndDate')?.value;
        
        if (!startDate || !endDate) {
            Notifications.warning('Please select both start and end dates');
            return;
        }
        
        try {
            const data = await API.get('/admin/reports/sales', { startDate, endDate });
            
            if (data.success) {
                this.displaySalesReport(data.data);
            }
        } catch (error) {
            console.error('Error generating sales report:', error);
            Notifications.error('Failed to generate sales report');
        }
    },
    
    displaySalesReport(reportData) {
        const container = document.getElementById('salesReportData');
        if (!container) return;
        
        container.innerHTML = `
            <div class="report-summary">
                <h4>Sales Summary</h4>
                <p><strong>Total Revenue:</strong> ${Utils.formatCurrency(reportData.totalRevenue || 0)}</p>
                <p><strong>Total Orders:</strong> ${reportData.totalOrders || 0}</p>
                <p><strong>Average Order Value:</strong> ${Utils.formatCurrency(reportData.averageOrderValue || 0)}</p>
            </div>
            <button class="btn btn-primary mt-3" onclick="ReportsPanel.exportSalesReport()">
                <i class="fas fa-download"></i> Export to CSV
            </button>
        `;
    },
    
    exportSalesReport() {
        Notifications.info('CSV export functionality coming soon');
    },
    
    async generateProductReport() {
        try {
            const data = await API.get('/admin/reports/products');
            
            if (data.success) {
                this.displayProductReport(data.data);
            }
        } catch (error) {
            console.error('Error generating product report:', error);
            Notifications.error('Failed to generate product report');
        }
    },
    
    displayProductReport(reportData) {
        const container = document.getElementById('productReportData');
        if (!container) return;
        
        const topProducts = reportData.topProducts || [];
        
        if (topProducts.length === 0) {
            container.innerHTML = '<p>No product data available</p>';
            return;
        }
        
        container.innerHTML = `
            <h4>Top Selling Products</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    ${topProducts.map(p => `
                        <tr>
                            <td>${Utils.escapeHtml(p.name)}</td>
                            <td>${p.unitsSold}</td>
                            <td>${Utils.formatCurrency(p.revenue)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
};

window.generateSalesReport = () => ReportsPanel.generateSalesReport();
window.generateProductReport = () => ReportsPanel.generateProductReport();
window.ReportsPanel = ReportsPanel;
