/**
 * Admin Dashboard Script
 * Main functionality for admin dashboard
 */

const API_BASE = ADMIN_CONFIG.API_BASE_URL;
let adminToken = null;
let adminInfo = null;

// ================================
// INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = '/admin/login.html';
        return;
    }
    
    const storedAdminInfo = localStorage.getItem('adminInfo');
    if (storedAdminInfo) {
        adminInfo = JSON.parse(storedAdminInfo);
        document.getElementById('adminName').textContent = adminInfo.fullName || adminInfo.email;
    }
    
    // Initialize dashboard
    initializeDashboard();
    
    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    document.getElementById('mobileSidebarToggle').addEventListener('click', toggleSidebar);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const panel = item.dataset.panel;
            showPanel(panel);
        });
    });
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Load initial data
    loadDashboardOverview();
});

// ================================
// API HELPER FUNCTIONS
// ================================

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
    };
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized - redirect to login
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminInfo');
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API request error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// ================================
// NAVIGATION & UI
// ================================

function initializeDashboard() {
    // Show the overview panel by default
    showPanel('overview');
}

function showPanel(panelName) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show selected panel
    const panel = document.getElementById(`${panelName}Panel`);
    if (panel) {
        panel.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navItem = document.querySelector(`.nav-item[data-panel="${panelName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'overview': 'Dashboard Overview',
        'orders': 'Orders Management',
        'payments': 'Payments Management',
        'customers': 'Customers Management',
        'products': 'Products & Inventory',
        'discounts': 'Discounts & Promotions',
        'returns': 'Returns & Refunds',
        'reports': 'Reports & Analytics',
        'compliance': 'Compliance & Legal',
        'logs': 'Security & Logs'
    };
    document.getElementById('pageTitle').textContent = titles[panelName] || 'Dashboard';
    
    // Load panel data
    loadPanelData(panelName);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ================================
// DATA LOADING FUNCTIONS
// ================================

function loadPanelData(panelName) {
    switch(panelName) {
        case 'overview':
            loadDashboardOverview();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'products':
            loadProducts();
            break;
        case 'discounts':
            loadDiscounts();
            break;
        case 'returns':
            loadReturns();
            break;
        case 'reports':
            // Reports are loaded on demand
            break;
        case 'compliance':
            loadVATRecords();
            loadPolicies();
            break;
        case 'logs':
            refreshActivityLogs();
            break;
    }
}

async function loadDashboardOverview() {
    try {
        const data = await apiRequest('/admin/dashboard/overview');
        
        if (data.success) {
            const overview = data.data;
            
            // Update stats
            document.getElementById('ordersToday').textContent = overview.ordersToday.count;
            document.getElementById('revenueToday').textContent = `R${overview.ordersToday.revenue.toFixed(2)}`;
            document.getElementById('pendingOrders').textContent = overview.pendingOrders;
            document.getElementById('lowStockProducts').textContent = overview.lowStockProducts;
            
            // Update recent orders table
            const tbody = document.getElementById('recentOrdersBody');
            if (overview.recentTransactions && overview.recentTransactions.length > 0) {
                tbody.innerHTML = overview.recentTransactions.map(order => `
                    <tr>
                        <td>${order.order_number}</td>
                        <td>${order.customer_name}</td>
                        <td>R${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                        <td>${new Date(order.placed_at).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No recent orders</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard overview:', error);
    }
}

async function loadOrders() {
    try {
        const status = document.getElementById('orderStatusFilter')?.value || '';
        const search = document.getElementById('orderSearch')?.value || '';
        
        let endpoint = '/admin/orders?';
        if (status) endpoint += `status=${status}&`;
        if (search) endpoint += `search=${search}&`;
        
        const data = await apiRequest(endpoint);
        
        if (data.success) {
            const tbody = document.getElementById('ordersTableBody');
            if (data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(order => `
                    <tr>
                        <td>${order.order_number}</td>
                        <td>${order.customer_name}</td>
                        <td>${order.customer_email}</td>
                        <td>R${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                        <td><span class="status-badge status-${order.payment_status}">${order.payment_status}</span></td>
                        <td>${new Date(order.placed_at).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function loadPayments() {
    try {
        const status = document.getElementById('paymentStatusFilter')?.value || '';
        let endpoint = '/admin/payments?';
        if (status) endpoint += `status=${status}`;
        
        const data = await apiRequest(endpoint);
        
        if (data.success) {
            const tbody = document.getElementById('paymentsTableBody');
            if (data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(payment => `
                    <tr>
                        <td>${payment.id.substring(0, 8)}...</td>
                        <td>${payment.order_number}</td>
                        <td>${payment.customer_name}</td>
                        <td>R${parseFloat(payment.amount).toFixed(2)}</td>
                        <td>${payment.payment_method}</td>
                        <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
                        <td>${new Date(payment.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No payments found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading payments:', error);
    }
}

async function loadCustomers() {
    try {
        const search = document.getElementById('customerSearch')?.value || '';
        let endpoint = '/admin/customers?';
        if (search) endpoint += `search=${search}`;
        
        const data = await apiRequest(endpoint);
        
        if (data.success) {
            const tbody = document.getElementById('customersTableBody');
            if (data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(customer => `
                    <tr>
                        <td>${customer.full_name}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone || 'N/A'}</td>
                        <td><span class="status-badge ${customer.is_active ? 'status-active' : 'status-inactive'}">
                            ${customer.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>${new Date(customer.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="viewCustomer('${customer.id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No customers found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

async function loadProducts() {
    try {
        const category = document.getElementById('productCategoryFilter')?.value || '';
        const search = document.getElementById('productSearch')?.value || '';
        
        let endpoint = '/admin/products?';
        if (category) endpoint += `category=${category}&`;
        if (search) endpoint += `search=${search}&`;
        
        const data = await apiRequest(endpoint);
        
        if (data.success) {
            const tbody = document.getElementById('productsTableBody');
            if (data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(product => {
                    const stockClass = product.stock_quantity <= product.low_stock_threshold ? 'status-warning' : '';
                    return `
                    <tr>
                        <td>${product.sku || 'N/A'}</td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>R${parseFloat(product.price_incl_vat).toFixed(2)}</td>
                        <td><span class="status-badge ${stockClass}">${product.stock_quantity}</span></td>
                        <td><span class="status-badge ${product.is_active ? 'status-active' : 'status-inactive'}">
                            ${product.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </td>
                    </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadDiscounts() {
    try {
        const data = await apiRequest('/admin/discounts');
        
        if (data.success) {
            const tbody = document.getElementById('discountsTableBody');
            if (data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(discount => {
                    const isExpired = discount.expires_at && new Date(discount.expires_at) < new Date();
                    return `
                    <tr>
                        <td><strong>${discount.code}</strong></td>
                        <td>${discount.description || 'N/A'}</td>
                        <td>${discount.discount_type}</td>
                        <td>${discount.discount_type === 'percentage' ? discount.discount_value + '%' : 'R' + discount.discount_value}</td>
                        <td>${discount.times_used || 0}</td>
                        <td>${discount.usage_limit || 'Unlimited'}</td>
                        <td>${discount.expires_at ? new Date(discount.expires_at).toLocaleDateString() : 'Never'}</td>
                        <td><span class="status-badge ${discount.is_active && !isExpired ? 'status-active' : 'status-inactive'}">
                            ${discount.is_active && !isExpired ? 'Active' : 'Inactive'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editDiscount('${discount.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                        </td>
                    </tr>
                    `;
                }).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center">No discounts found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading discounts:', error);
    }
}

async function loadReturns() {
    try {
        const status = document.getElementById('returnStatusFilter')?.value || '';
        let endpoint = '/admin/returns?';
        if (status) endpoint += `status=${status}`;
        
        const data = await apiRequest(endpoint);
        
        if (data.success) {
            const tbody = document.getElementById('returnsTableBody');
            if (data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(returnItem => `
                    <tr>
                        <td>${returnItem.return_number}</td>
                        <td>${returnItem.order_number}</td>
                        <td>${returnItem.customer_name || 'N/A'}</td>
                        <td>${returnItem.reason}</td>
                        <td><span class="status-badge status-${returnItem.status}">${returnItem.status}</span></td>
                        <td>${new Date(returnItem.requested_at).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="viewReturn('${returnItem.id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No returns found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading returns:', error);
    }
}

async function loadVATRecords() {
    try {
        const data = await apiRequest('/admin/compliance/vat');
        
        if (data.success) {
            const tbody = document.getElementById('vatRecordsBody');
            if (data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(record => `
                    <tr>
                        <td>${record.invoice_number || 'N/A'}</td>
                        <td>${record.order_number || 'N/A'}</td>
                        <td>${new Date(record.invoice_date).toLocaleDateString()}</td>
                        <td>R${parseFloat(record.subtotal).toFixed(2)}</td>
                        <td>R${parseFloat(record.vat_amount).toFixed(2)}</td>
                        <td>R${parseFloat(record.total_incl_vat).toFixed(2)}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No VAT records found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading VAT records:', error);
    }
}

async function loadPolicies() {
    try {
        const data = await apiRequest('/admin/compliance/policies');
        
        if (data.success) {
            const container = document.getElementById('policyDocuments');
            if (data.data && data.data.length > 0) {
                container.innerHTML = data.data.map(policy => `
                    <div class="policy-item">
                        <h4>${policy.title}</h4>
                        <p>Type: ${policy.policy_type} | Version: ${policy.version}</p>
                        <p>Effective: ${new Date(policy.effective_date).toLocaleDateString()}</p>
                        <span class="status-badge ${policy.is_active ? 'status-active' : 'status-inactive'}">
                            ${policy.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p>No policy documents found</p>';
            }
        }
    } catch (error) {
        console.error('Error loading policies:', error);
    }
}

async function refreshActivityLogs() {
    try {
        const severity = document.getElementById('activitySeverityFilter')?.value || '';
        let endpoint = '/admin/logs/activity?';
        if (severity) endpoint += `severity=${severity}`;
        
        const data = await apiRequest(endpoint);
        
        if (data.success) {
            const tbody = document.getElementById('activityLogsBody');
            if (data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(log => `
                    <tr>
                        <td>${log.admin_name}</td>
                        <td>${log.action}</td>
                        <td>${log.entity_type || 'N/A'}</td>
                        <td>${log.ip_address}</td>
                        <td><span class="status-badge status-${log.severity}">${log.severity}</span></td>
                        <td>${new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No activity logs found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading activity logs:', error);
    }
}

async function refreshSecurityEvents() {
    try {
        const severity = document.getElementById('securitySeverityFilter')?.value || '';
        let endpoint = '/admin/logs/security?';
        if (severity) endpoint += `severity=${severity}`;
        
        const data = await apiRequest(endpoint);
        
        if (data.success) {
            const tbody = document.getElementById('securityEventsBody');
            if (data.data && data.data.length > 0) {
                tbody.innerHTML = data.data.map(event => `
                    <tr>
                        <td>${event.event_type}</td>
                        <td>${event.description}</td>
                        <td><span class="status-badge status-${event.severity}">${event.severity}</span></td>
                        <td>${event.ip_address || 'N/A'}</td>
                        <td>${event.resolved ? 'Yes' : 'No'}</td>
                        <td>${new Date(event.created_at).toLocaleString()}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No security events found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading security events:', error);
    }
}

// ================================
// REFRESH FUNCTIONS
// ================================

function refreshOrders() {
    loadOrders();
    showNotification('Orders refreshed', 'success');
}

function refreshPayments() {
    loadPayments();
    showNotification('Payments refreshed', 'success');
}

function refreshCustomers() {
    loadCustomers();
    showNotification('Customers refreshed', 'success');
}

function refreshProducts() {
    loadProducts();
    showNotification('Products refreshed', 'success');
}

function refreshDiscounts() {
    loadDiscounts();
    showNotification('Discounts refreshed', 'success');
}

function refreshReturns() {
    loadReturns();
    showNotification('Returns refreshed', 'success');
}

// ================================
// ACTION FUNCTIONS (Placeholders)
// ================================

function viewOrder(id) {
    showNotification('Order details functionality coming soon', 'info');
}

function viewCustomer(id) {
    showNotification('Customer details functionality coming soon', 'info');
}

function editProduct(id) {
    showNotification('Product edit functionality coming soon', 'info');
}

function showAddProductModal() {
    showNotification('Add product functionality coming soon', 'info');
}

function editDiscount(id) {
    showNotification('Discount edit functionality coming soon', 'info');
}

function showAddDiscountModal() {
    showNotification('Add discount functionality coming soon', 'info');
}

function viewReturn(id) {
    showNotification('Return details functionality coming soon', 'info');
}

function generateSalesReport() {
    showNotification('Sales report generation coming soon', 'info');
}

function generateProductReport() {
    showNotification('Product report generation coming soon', 'info');
}

// ================================
// LOGOUT
// ================================

async function handleLogout() {
    try {
        await apiRequest('/admin/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = '/admin/login.html';
    }
}
