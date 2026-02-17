/**
 * Compliance Panel
 * VAT records and policy management
 */

const CompliancePanel = {
    async init() {
        await this.loadVATRecords();
        await this.loadPolicies();
    },
    
    async loadVATRecords() {
        try {
            const data = await API.get('/admin/compliance/vat');
            
            if (data.success) {
                this.renderVATRecords(data.data || []);
            }
        } catch (error) {
            console.error('Error loading VAT records:', error);
        }
    },
    
    renderVATRecords(records) {
        const tbody = document.getElementById('vatRecordsBody');
        if (!tbody) return;
        
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No VAT records found</td></tr>';
            return;
        }
        
        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${Utils.escapeHtml(record.invoice_number || 'N/A')}</td>
                <td>${Utils.escapeHtml(record.order_number || 'N/A')}</td>
                <td>${Utils.formatDate(record.invoice_date)}</td>
                <td>${Utils.formatCurrency(record.subtotal)}</td>
                <td>${Utils.formatCurrency(record.vat_amount)}</td>
                <td>${Utils.formatCurrency(record.total_incl_vat)}</td>
            </tr>
        `).join('');
    },
    
    async loadPolicies() {
        try {
            const data = await API.get('/admin/compliance/policies');
            
            if (data.success) {
                this.renderPolicies(data.data || []);
            }
        } catch (error) {
            console.error('Error loading policies:', error);
        }
    },
    
    renderPolicies(policies) {
        const container = document.getElementById('policyDocuments');
        if (!container) return;
        
        if (policies.length === 0) {
            container.innerHTML = '<p>No policy documents found</p>';
            return;
        }
        
        container.innerHTML = policies.map(policy => `
            <div class="policy-item">
                <h4>${Utils.escapeHtml(policy.title)}</h4>
                <p><strong>Type:</strong> ${Utils.capitalize(policy.policy_type)} | <strong>Version:</strong> ${policy.version}</p>
                <p><strong>Effective:</strong> ${Utils.formatDate(policy.effective_date)}</p>
                ${Utils.getStatusBadge(policy.is_active ? 'active' : 'inactive', 
                                      policy.is_active ? 'Active' : 'Inactive')}
            </div>
        `).join('');
    }
};

window.loadVATRecords = () => CompliancePanel.loadVATRecords();
window.CompliancePanel = CompliancePanel;
