/**
 * Payments Panel
 * Payment transactions and refund management
 */

const PaymentsPanel = {
    async init() {
        this.setupEventListeners();
        await this.load();
    },
    
    setupEventListeners() {
        const statusFilter = document.getElementById('paymentStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.load();
            });
        }
    },
    
    async load() {
        try {
            const status = document.getElementById('paymentStatusFilter')?.value || '';
            const data = await API.get('/admin/payments', { status });
            
            if (data.success) {
                this.renderPayments(data.data || []);
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            Notifications.error('Failed to load payments');
        }
    },
    
    renderPayments(payments) {
        const tbody = document.getElementById('paymentsTableBody');
        if (!tbody) return;
        
        if (payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No payments found</td></tr>';
            return;
        }
        
        tbody.innerHTML = payments.map(payment => `
            <tr>
                <td>${payment.id.substring(0, 8)}...</td>
                <td>${Utils.escapeHtml(payment.order_number)}</td>
                <td>${Utils.escapeHtml(payment.customer_name)}</td>
                <td>${Utils.formatCurrency(payment.amount)}</td>
                <td>${Utils.capitalize(payment.payment_method)}</td>
                <td>${Utils.getStatusBadge(payment.status)}</td>
                <td>${Utils.formatDate(payment.created_at)}</td>
            </tr>
        `).join('');
    },
    
    async refresh() {
        await this.load();
        Notifications.success('Payments refreshed');
    }
};

window.refreshPayments = () => PaymentsPanel.refresh();
window.PaymentsPanel = PaymentsPanel;
