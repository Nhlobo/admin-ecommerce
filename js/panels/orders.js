/**
 * Orders Panel
 * Orders management with filtering, search, and details modal
 */

const OrdersPanel = {
    currentPage: 1,
    pageSize: 20,
    currentFilters: {},
    
    /**
     * Initialize orders panel
     */
    async init() {
        this.setupEventListeners();
        await this.load();
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.currentFilters.search = searchInput.value;
                this.currentPage = 1;
                this.load();
            }, 500));
        }
        
        // Status filter
        const statusFilter = document.getElementById('orderStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentFilters.status = statusFilter.value;
                this.currentPage = 1;
                this.load();
            });
        }
    },
    
    /**
     * Load orders data
     */
    async load() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...this.currentFilters
            };
            
            const data = await API.get('/admin/orders', params);
            
            if (data.success) {
                this.renderOrders(data.data || []);
                this.renderPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            Notifications.error('Failed to load orders');
        }
    },
    
    /**
     * Render orders table
     */
    renderOrders(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
            return;
        }
        
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${Utils.escapeHtml(order.order_number)}</td>
                <td>${Utils.escapeHtml(order.customer_name)}</td>
                <td>${Utils.escapeHtml(order.customer_email)}</td>
                <td>${Utils.formatCurrency(order.total_amount)}</td>
                <td>${Utils.getStatusBadge(order.status)}</td>
                <td>${Utils.getStatusBadge(order.payment_status)}</td>
                <td>${Utils.formatDate(order.placed_at)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="OrdersPanel.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * Render pagination
     */
    renderPagination(pagination) {
        const container = document.getElementById('ordersPagination');
        if (!container || !pagination) return;
        
        const { currentPage, totalPages, totalItems } = pagination;
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination-controls">';
        html += `<span class="pagination-info">Page ${currentPage} of ${totalPages} (${totalItems} orders)</span>`;
        html += '<div class="pagination-buttons">';
        
        // Previous button
        html += `<button class="btn btn-sm" ${currentPage === 1 ? 'disabled' : ''} 
                 onclick="OrdersPanel.goToPage(${currentPage - 1})">
                 <i class="fas fa-chevron-left"></i> Previous
                 </button>`;
        
        // Next button
        html += `<button class="btn btn-sm" ${currentPage === totalPages ? 'disabled' : ''} 
                 onclick="OrdersPanel.goToPage(${currentPage + 1})">
                 Next <i class="fas fa-chevron-right"></i>
                 </button>`;
        
        html += '</div></div>';
        container.innerHTML = html;
    },
    
    /**
     * Go to specific page
     */
    async goToPage(page) {
        this.currentPage = page;
        await this.load();
    },
    
    /**
     * View order details
     */
    async viewOrder(orderId) {
        try {
            const data = await API.get(`/admin/orders/${orderId}`);
            
            if (data.success) {
                this.showOrderModal(data.data);
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            Notifications.error('Failed to load order details');
        }
    },
    
    /**
     * Show order details modal
     */
    showOrderModal(order) {
        const modal = this.createOrderModal(order);
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    },
    
    /**
     * Create order modal
     */
    createOrderModal(order) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'orderModal';
        
        const items = order.items || [];
        const itemsHtml = items.map(item => `
            <tr>
                <td>${Utils.escapeHtml(item.product_name)}</td>
                <td>${item.quantity}</td>
                <td>${Utils.formatCurrency(item.price)}</td>
                <td>${Utils.formatCurrency(item.quantity * item.price)}</td>
            </tr>
        `).join('');
        
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>Order Details - ${Utils.escapeHtml(order.order_number)}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="order-details-grid">
                        <div class="detail-section">
                            <h4>Customer Information</h4>
                            <p><strong>Name:</strong> ${Utils.escapeHtml(order.customer_name)}</p>
                            <p><strong>Email:</strong> ${Utils.escapeHtml(order.customer_email)}</p>
                            <p><strong>Phone:</strong> ${Utils.formatPhone(order.customer_phone)}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Shipping Address</h4>
                            <p>${Utils.escapeHtml(order.shipping_address || 'N/A')}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h4>Order Status</h4>
                            <p>${Utils.getStatusBadge(order.status)}</p>
                            <p><strong>Payment:</strong> ${Utils.getStatusBadge(order.payment_status)}</p>
                            <p><strong>Placed:</strong> ${Utils.formatDateTime(order.placed_at)}</p>
                        </div>
                    </div>
                    
                    <h4>Order Items</h4>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                                <td><strong>${Utils.formatCurrency(order.total_amount)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    ${AdminAuth.hasPermission('update_orders') ? `
                    <div class="status-update-section">
                        <label for="orderStatusUpdate">Update Status:</label>
                        <select id="orderStatusUpdate" class="form-input">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button class="btn btn-primary" onclick="OrdersPanel.updateOrderStatus('${order.id}')">
                            Update Status
                        </button>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="OrdersPanel.printInvoice('${order.id}')">
                        <i class="fas fa-print"></i> Print Invoice
                    </button>
                </div>
            </div>
        `;
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        return modal;
    },
    
    /**
     * Update order status
     */
    async updateOrderStatus(orderId) {
        const select = document.getElementById('orderStatusUpdate');
        if (!select) return;
        
        const newStatus = select.value;
        
        Notifications.confirm(
            `Are you sure you want to update the order status to "${newStatus}"?`,
            async () => {
                try {
                    const data = await API.put(`/admin/orders/${orderId}/status`, {
                        status: newStatus
                    });
                    
                    if (data.success) {
                        Notifications.success('Order status updated successfully');
                        document.getElementById('orderModal')?.remove();
                        await this.load();
                    }
                } catch (error) {
                    console.error('Error updating order status:', error);
                    Notifications.error('Failed to update order status');
                }
            }
        );
    },
    
    /**
     * Print invoice
     */
    printInvoice(orderId) {
        Notifications.info('Invoice printing will be implemented with backend support');
        // TODO: Implement invoice generation and printing
    },
    
    /**
     * Refresh orders
     */
    async refresh() {
        await this.load();
        Notifications.success('Orders refreshed');
    }
};

// Make refresh function available globally
window.refreshOrders = () => OrdersPanel.refresh();

// Export
if (typeof window !== 'undefined') {
    window.OrdersPanel = OrdersPanel;
}
