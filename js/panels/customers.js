/**
 * Customers Panel
 * Customer management and details
 */

const CustomersPanel = {
    async init() {
        this.setupEventListeners();
        await this.load();
    },
    
    setupEventListeners() {
        const searchInput = document.getElementById('customerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.load();
            }, 500));
        }
    },
    
    async load() {
        try {
            const search = document.getElementById('customerSearch')?.value || '';
            const data = await API.get('/admin/customers', { search });
            
            if (data.success) {
                this.renderCustomers(data.data || []);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            Notifications.error('Failed to load customers');
        }
    },
    
    renderCustomers(customers) {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;
        
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No customers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${Utils.escapeHtml(customer.full_name)}</td>
                <td>${Utils.escapeHtml(customer.email)}</td>
                <td>${Utils.formatPhone(customer.phone)}</td>
                <td>${Utils.getStatusBadge(customer.is_active ? 'active' : 'inactive', 
                                          customer.is_active ? 'Active' : 'Inactive')}</td>
                <td>${Utils.formatDate(customer.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="CustomersPanel.viewCustomer('${customer.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    async viewCustomer(customerId) {
        Notifications.info('Customer details view coming soon');
    },
    
    async refresh() {
        await this.load();
        Notifications.success('Customers refreshed');
    }
};

window.refreshCustomers = () => CustomersPanel.refresh();
window.viewCustomer = (id) => CustomersPanel.viewCustomer(id);
window.CustomersPanel = CustomersPanel;
