/**
 * Products Panel
 * Products and inventory management with add/edit modals
 */

const ProductsPanel = {
    currentPage: 1,
    pageSize: 20,
    currentFilters: {},
    
    /**
     * Initialize products panel
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
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.currentFilters.search = searchInput.value;
                this.currentPage = 1;
                this.load();
            }, 500));
        }
        
        // Category filter
        const categoryFilter = document.getElementById('productCategoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.currentFilters.category = categoryFilter.value;
                this.currentPage = 1;
                this.load();
            });
        }
    },
    
    /**
     * Load products data
     */
    async load() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...this.currentFilters
            };
            
            const data = await API.get('/admin/products', params);
            
            if (data.success) {
                this.renderProducts(data.data || []);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            Notifications.error('Failed to load products');
        }
    },
    
    /**
     * Render products table
     */
    renderProducts(products) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.map(product => {
            const stockClass = Utils.isLowStock(product.stock_quantity, product.low_stock_threshold) ? 
                              'status-warning' : '';
            
            return `
            <tr>
                <td>${Utils.escapeHtml(product.sku || 'N/A')}</td>
                <td>${Utils.escapeHtml(product.name)}</td>
                <td>${Utils.capitalize(product.category)}</td>
                <td>${Utils.formatCurrency(product.price_incl_vat)}</td>
                <td><span class="status-badge ${stockClass}">${product.stock_quantity}</span></td>
                <td>${Utils.getStatusBadge(product.is_active ? 'active' : 'inactive', 
                                          product.is_active ? 'Active' : 'Inactive')}</td>
                <td>
                    ${AdminAuth.hasPermission('update_products') ? `
                    <button class="btn btn-sm btn-primary" onclick="ProductsPanel.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ` : ''}
                </td>
            </tr>
            `;
        }).join('');
    },
    
    /**
     * Show add product modal
     */
    showAddModal() {
        if (!AdminAuth.hasPermission('update_products')) {
            Notifications.error('You do not have permission to add products');
            return;
        }
        
        const modal = this.createProductModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    },
    
    /**
     * Edit product
     */
    async editProduct(productId) {
        if (!AdminAuth.hasPermission('update_products')) {
            Notifications.error('You do not have permission to edit products');
            return;
        }
        
        try {
            const data = await API.get(`/admin/products/${productId}`);
            
            if (data.success) {
                const modal = this.createProductModal(data.data);
                document.body.appendChild(modal);
                modal.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error loading product:', error);
            Notifications.error('Failed to load product details');
        }
    },
    
    /**
     * Create product modal
     */
    createProductModal(product = null) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'productModal';
        
        const isEdit = !!product;
        
        modal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>${isEdit ? 'Edit' : 'Add'} Product</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="productForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productName">Product Name *</label>
                                <input type="text" id="productName" name="name" class="form-input" 
                                       value="${product ? Utils.escapeHtml(product.name) : ''}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="productSKU">SKU</label>
                                <input type="text" id="productSKU" name="sku" class="form-input" 
                                       value="${product ? Utils.escapeHtml(product.sku || '') : ''}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="productDescription">Description</label>
                            <textarea id="productDescription" name="description" class="form-input" 
                                      rows="4">${product ? Utils.escapeHtml(product.description || '') : ''}</textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productCategory">Category *</label>
                                <select id="productCategory" name="category" class="form-input" required>
                                    <option value="">Select Category</option>
                                    <option value="wigs" ${product?.category === 'wigs' ? 'selected' : ''}>Wigs</option>
                                    <option value="extensions" ${product?.category === 'extensions' ? 'selected' : ''}>Extensions</option>
                                    <option value="accessories" ${product?.category === 'accessories' ? 'selected' : ''}>Accessories</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="productPrice">Price (incl. VAT) *</label>
                                <input type="number" id="productPrice" name="price_incl_vat" class="form-input" 
                                       step="0.01" min="0" value="${product ? product.price_incl_vat : ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="productStock">Stock Quantity *</label>
                                <input type="number" id="productStock" name="stock_quantity" class="form-input" 
                                       min="0" value="${product ? product.stock_quantity : 0}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="productLowStock">Low Stock Threshold</label>
                                <input type="number" id="productLowStock" name="low_stock_threshold" class="form-input" 
                                       min="0" value="${product ? product.low_stock_threshold : 5}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="productActive" name="is_active" 
                                       ${!product || product.is_active ? 'checked' : ''}>
                                <span>Active</span>
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="ProductsPanel.saveProduct(${isEdit ? `'${product.id}'` : 'null'})">
                        <i class="fas fa-save"></i> ${isEdit ? 'Update' : 'Create'} Product
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
     * Save product (create or update)
     */
    async saveProduct(productId = null) {
        const form = document.getElementById('productForm');
        if (!form) return;
        
        // Get form data
        const formData = new FormData(form);
        const productData = {
            name: formData.get('name'),
            sku: formData.get('sku'),
            description: formData.get('description'),
            category: formData.get('category'),
            price_incl_vat: parseFloat(formData.get('price_incl_vat')),
            stock_quantity: parseInt(formData.get('stock_quantity')),
            low_stock_threshold: parseInt(formData.get('low_stock_threshold')),
            is_active: form.querySelector('#productActive').checked
        };
        
        // Validate
        const validation = Validation.validateForm({
            name: [{ rule: 'required', fieldName: 'Product name' }],
            category: [{ rule: 'required', fieldName: 'Category' }],
            price_incl_vat: [
                { rule: 'required', fieldName: 'Price' },
                { rule: 'positiveNumber', fieldName: 'Price' }
            ],
            stock_quantity: [
                { rule: 'required', fieldName: 'Stock quantity' },
                { rule: 'min', min: 0, fieldName: 'Stock quantity' }
            ]
        }, productData);
        
        if (!validation.valid) {
            Validation.displayErrors(validation.errors);
            return;
        }
        
        try {
            let data;
            if (productId) {
                data = await API.put(`/admin/products/${productId}`, productData);
            } else {
                data = await API.post('/admin/products', productData);
            }
            
            if (data.success) {
                Notifications.success(`Product ${productId ? 'updated' : 'created'} successfully`);
                document.getElementById('productModal')?.remove();
                await this.load();
            }
        } catch (error) {
            console.error('Error saving product:', error);
            Notifications.error(`Failed to ${productId ? 'update' : 'create'} product`);
        }
    },
    
    /**
     * Refresh products
     */
    async refresh() {
        await this.load();
        Notifications.success('Products refreshed');
    }
};

// Make functions available globally
window.refreshProducts = () => ProductsPanel.refresh();
window.showAddProductModal = () => ProductsPanel.showAddModal();
window.editProduct = (id) => ProductsPanel.editProduct(id);

// Export
if (typeof window !== 'undefined') {
    window.ProductsPanel = ProductsPanel;
}
