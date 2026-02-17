/**
 * Discounts Panel
 * Discount codes and promotions management
 */

const DiscountsPanel = {
    /**
     * Initialize discounts panel
     */
    async init() {
        await this.load();
    },
    
    /**
     * Load discounts data
     */
    async load() {
        try {
            const data = await API.get('/admin/discounts');
            
            if (data.success) {
                this.renderDiscounts(data.data || []);
            }
        } catch (error) {
            console.error('Error loading discounts:', error);
            Notifications.error('Failed to load discounts');
        }
    },
    
    /**
     * Render discounts table
     */
    renderDiscounts(discounts) {
        const tbody = document.getElementById('discountsTableBody');
        if (!tbody) return;
        
        if (discounts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No discounts found</td></tr>';
            return;
        }
        
        tbody.innerHTML = discounts.map(discount => {
            const isExpired = discount.expires_at && new Date(discount.expires_at) < new Date();
            const isActive = discount.is_active && !isExpired;
            
            return `
            <tr>
                <td><strong>${Utils.escapeHtml(discount.code)}</strong></td>
                <td>${Utils.escapeHtml(discount.description || 'N/A')}</td>
                <td>${Utils.capitalize(discount.discount_type)}</td>
                <td>${discount.discount_type === 'percentage' ? 
                     discount.discount_value + '%' : 
                     Utils.formatCurrency(discount.discount_value)}</td>
                <td>${discount.times_used || 0}</td>
                <td>${discount.usage_limit || 'Unlimited'}</td>
                <td>${discount.expires_at ? Utils.formatDate(discount.expires_at) : 'Never'}</td>
                <td>${Utils.getStatusBadge(isActive ? 'active' : 'inactive', 
                                          isActive ? 'Active' : 'Inactive')}</td>
                <td>
                    ${AdminAuth.hasPermission('update_products') ? `
                    <button class="btn btn-sm btn-primary" onclick="DiscountsPanel.editDiscount('${discount.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ` : ''}
                </td>
            </tr>
            `;
        }).join('');
    },
    
    /**
     * Show add discount modal
     */
    showAddModal() {
        const modal = this.createDiscountModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    },
    
    /**
     * Edit discount
     */
    async editDiscount(discountId) {
        try {
            const data = await API.get(`/admin/discounts/${discountId}`);
            
            if (data.success) {
                const modal = this.createDiscountModal(data.data);
                document.body.appendChild(modal);
                modal.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error loading discount:', error);
            Notifications.error('Failed to load discount details');
        }
    },
    
    /**
     * Create discount modal
     */
    createDiscountModal(discount = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'discountModal';
        
        const isEdit = !!discount;
        const expiryDate = discount?.expires_at ? new Date(discount.expires_at).toISOString().split('T')[0] : '';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? 'Edit' : 'Create'} Discount</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="discountForm">
                        <div class="form-group">
                            <label for="discountCode">Discount Code *</label>
                            <input type="text" id="discountCode" name="code" class="form-input" 
                                   value="${discount ? Utils.escapeHtml(discount.code) : ''}" 
                                   ${isEdit ? 'readonly' : ''} style="text-transform: uppercase;" required>
                            <small>Uppercase letters, numbers, hyphens, and underscores only</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="discountDescription">Description</label>
                            <input type="text" id="discountDescription" name="description" class="form-input" 
                                   value="${discount ? Utils.escapeHtml(discount.description || '') : ''}">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="discountType">Type *</label>
                                <select id="discountType" name="discount_type" class="form-input" required>
                                    <option value="percentage" ${discount?.discount_type === 'percentage' ? 'selected' : ''}>Percentage</option>
                                    <option value="fixed" ${discount?.discount_type === 'fixed' ? 'selected' : ''}>Fixed Amount</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="discountValue">Value *</label>
                                <input type="number" id="discountValue" name="discount_value" class="form-input" 
                                       step="0.01" min="0" value="${discount ? discount.discount_value : ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="usageLimit">Usage Limit</label>
                                <input type="number" id="usageLimit" name="usage_limit" class="form-input" 
                                       min="0" value="${discount ? discount.usage_limit || '' : ''}">
                                <small>Leave empty for unlimited</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="expiryDate">Expiry Date</label>
                                <input type="date" id="expiryDate" name="expires_at" class="form-input" 
                                       value="${expiryDate}">
                                <small>Leave empty for no expiry</small>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="discountActive" name="is_active" 
                                       ${!discount || discount.is_active ? 'checked' : ''}>
                                <span>Active</span>
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="DiscountsPanel.saveDiscount(${isEdit ? `'${discount.id}'` : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        return modal;
    },
    
    /**
     * Save discount
     */
    async saveDiscount(discountId = null) {
        const form = document.getElementById('discountForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const discountData = {
            code: formData.get('code').toUpperCase(),
            description: formData.get('description'),
            discount_type: formData.get('discount_type'),
            discount_value: parseFloat(formData.get('discount_value')),
            usage_limit: formData.get('usage_limit') ? parseInt(formData.get('usage_limit')) : null,
            expires_at: formData.get('expires_at') || null,
            is_active: form.querySelector('#discountActive').checked
        };
        
        // Validate
        const rules = {
            code: [
                { rule: 'required', fieldName: 'Discount code' },
                { rule: 'discountCode' }
            ],
            discount_value: [
                { rule: 'required', fieldName: 'Discount value' },
                { rule: 'positiveNumber', fieldName: 'Discount value' }
            ]
        };
        
        // Add percentage validation if type is percentage
        if (discountData.discount_type === 'percentage') {
            rules.discount_value.push({ rule: 'max', max: 100, fieldName: 'Discount value' });
        }
        
        const validation = Validation.validateForm(rules, discountData);
        
        if (!validation.valid) {
            Validation.displayErrors(validation.errors);
            return;
        }
        
        try {
            let data;
            if (discountId) {
                data = await API.put(`/admin/discounts/${discountId}`, discountData);
            } else {
                data = await API.post('/admin/discounts', discountData);
            }
            
            if (data.success) {
                Notifications.success(`Discount ${discountId ? 'updated' : 'created'} successfully`);
                document.getElementById('discountModal')?.remove();
                await this.load();
            }
        } catch (error) {
            console.error('Error saving discount:', error);
            Notifications.error(`Failed to ${discountId ? 'update' : 'create'} discount`);
        }
    },
    
    /**
     * Refresh discounts
     */
    async refresh() {
        await this.load();
        Notifications.success('Discounts refreshed');
    }
};

// Global functions
window.refreshDiscounts = () => DiscountsPanel.refresh();
window.showAddDiscountModal = () => DiscountsPanel.showAddModal();
window.editDiscount = (id) => DiscountsPanel.editDiscount(id);

// Export
if (typeof window !== 'undefined') {
    window.DiscountsPanel = DiscountsPanel;
}
