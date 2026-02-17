/**
 * Compliance Panel
 * VAT records and policy management with reporting
 */

const CompliancePanel = {
    currentVATFilters: {
        dateFrom: '',
        dateTo: '',
        reportType: 'monthly'
    },
    
    async init() {
        this.setupEventListeners();
        await this.loadVATRecords();
        await this.loadPolicies();
        this.updateVATSummary();
    },
    
    setupEventListeners() {
        // Date range filters
        const dateFromInput = document.getElementById('vatDateFrom');
        const dateToInput = document.getElementById('vatDateTo');
        
        if (dateFromInput) {
            dateFromInput.addEventListener('change', () => {
                this.currentVATFilters.dateFrom = dateFromInput.value;
                this.loadVATRecords();
                this.updateVATSummary();
            });
        }
        
        if (dateToInput) {
            dateToInput.addEventListener('change', () => {
                this.currentVATFilters.dateTo = dateToInput.value;
                this.loadVATRecords();
                this.updateVATSummary();
            });
        }
        
        // Report type selector
        const reportTypeSelect = document.getElementById('vatReportType');
        if (reportTypeSelect) {
            reportTypeSelect.addEventListener('change', () => {
                this.currentVATFilters.reportType = reportTypeSelect.value;
                this.setQuickDateRange(reportTypeSelect.value);
            });
        }
    },
    
    /**
     * Set quick date range based on report type
     */
    setQuickDateRange(reportType) {
        const now = new Date();
        let dateFrom, dateTo;
        
        switch(reportType) {
            case 'daily':
                dateFrom = new Date(now);
                dateTo = new Date(now);
                break;
            case 'weekly':
                dateFrom = new Date(now.setDate(now.getDate() - 7));
                dateTo = new Date();
                break;
            case 'monthly':
                dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
                dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'quarterly':
                const quarter = Math.floor(now.getMonth() / 3);
                dateFrom = new Date(now.getFullYear(), quarter * 3, 1);
                dateTo = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                break;
            case 'annually':
                dateFrom = new Date(now.getFullYear(), 0, 1);
                dateTo = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                return;
        }
        
        // Update input fields
        const dateFromInput = document.getElementById('vatDateFrom');
        const dateToInput = document.getElementById('vatDateTo');
        
        if (dateFromInput) {
            dateFromInput.value = dateFrom.toISOString().split('T')[0];
            this.currentVATFilters.dateFrom = dateFromInput.value;
        }
        if (dateToInput) {
            dateTo.value = dateTo.toISOString().split('T')[0];
            this.currentVATFilters.dateTo = dateToInput.value;
        }
        
        this.loadVATRecords();
        this.updateVATSummary();
    },
    
    async loadVATRecords() {
        try {
            const params = {
                ...this.currentVATFilters
            };
            
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.vatRecords, params);
            
            if (data.success) {
                this.renderVATRecords(data.data || []);
            }
        } catch (error) {
            console.error('Error loading VAT records:', error);
            Notifications.error('Failed to load VAT records');
        }
    },
    
    renderVATRecords(records) {
        const tbody = document.getElementById('vatRecordsBody');
        if (!tbody) return;
        
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No VAT records found</td></tr>';
            return;
        }
        
        tbody.innerHTML = records.map(record => `
            <tr>
                <td>${Utils.escapeHtml(record.invoice_number || 'N/A')}</td>
                <td>${Utils.escapeHtml(record.order_number || 'N/A')}</td>
                <td>${Utils.formatDate(record.invoice_date)}</td>
                <td>${Utils.escapeHtml(record.category || 'General')}</td>
                <td>${Utils.formatCurrency(record.subtotal)}</td>
                <td>${Utils.formatCurrency(record.vat_amount)}</td>
                <td>${Utils.formatCurrency(record.total_incl_vat)}</td>
            </tr>
        `).join('');
    },
    
    /**
     * Update VAT summary statistics
     */
    async updateVATSummary() {
        try {
            const params = {
                date_from: this.currentVATFilters.dateFrom,
                date_to: this.currentVATFilters.dateTo
            };
            
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.vatReport, params);
            
            if (data.success && data.summary) {
                this.renderVATSummary(data.summary);
            }
        } catch (error) {
            console.error('Error loading VAT summary:', error);
        }
    },
    
    /**
     * Render VAT summary statistics
     */
    renderVATSummary(summary) {
        const summaryContainer = document.getElementById('vatSummaryStats');
        if (!summaryContainer) return;
        
        summaryContainer.innerHTML = `
            <div class="vat-stat-card">
                <div class="vat-stat-label">Total Sales (Excl VAT)</div>
                <div class="vat-stat-value">${Utils.formatCurrency(summary.totalExclVAT || 0)}</div>
            </div>
            <div class="vat-stat-card">
                <div class="vat-stat-label">Total VAT Collected</div>
                <div class="vat-stat-value">${Utils.formatCurrency(summary.totalVAT || 0)}</div>
            </div>
            <div class="vat-stat-card">
                <div class="vat-stat-label">Total Sales (Incl VAT)</div>
                <div class="vat-stat-value">${Utils.formatCurrency(summary.totalInclVAT || 0)}</div>
            </div>
            <div class="vat-stat-card">
                <div class="vat-stat-label">Transaction Count</div>
                <div class="vat-stat-value">${summary.transactionCount || 0}</div>
            </div>
        `;
    },
    
    /**
     * Export VAT report as CSV
     */
    async exportVATReport(format = 'csv') {
        try {
            const params = {
                date_from: this.currentVATFilters.dateFrom,
                date_to: this.currentVATFilters.dateTo,
                format: format
            };
            
            Notifications.info('Generating VAT report...');
            
            const response = await fetch(
                getApiUrl(ADMIN_CONFIG.ENDPOINTS.vatReport) + '?' + new URLSearchParams(params),
                {
                    headers: {
                        'Authorization': `Bearer ${AdminAuth.getToken()}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to export VAT report');
            }
            
            // Download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            const dateRange = this.currentVATFilters.dateFrom && this.currentVATFilters.dateTo
                ? `${this.currentVATFilters.dateFrom}_to_${this.currentVATFilters.dateTo}`
                : 'all';
            a.download = `vat_report_${dateRange}.${format}`;
            
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            Notifications.success('VAT report exported successfully');
        } catch (error) {
            console.error('Error exporting VAT report:', error);
            Notifications.error('Failed to export VAT report');
        }
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
window.exportVATReportCSV = () => CompliancePanel.exportVATReport('csv');
window.exportVATReportPDF = () => CompliancePanel.exportVATReport('pdf');
window.CompliancePanel = CompliancePanel;
