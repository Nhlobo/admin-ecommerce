/**
 * Reviews Panel
 * Product review moderation and management
 */

const ReviewsPanel = {
    currentPage: 1,
    pageSize: 20,
    currentFilters: {
        status: '',
        rating: '',
        product: ''
    },
    selectedReviews: new Set(),
    
    /**
     * Initialize reviews panel
     */
    async init() {
        this.setupEventListeners();
        await this.load();
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search by product name or customer
        const searchInput = document.getElementById('reviewSearch');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.currentFilters.search = searchInput.value;
                this.currentPage = 1;
                this.load();
            }, 500));
        }
        
        // Status filter
        const statusFilter = document.getElementById('reviewStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.currentFilters.status = statusFilter.value;
                this.currentPage = 1;
                this.load();
            });
        }
        
        // Rating filter
        const ratingFilter = document.getElementById('reviewRatingFilter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', () => {
                this.currentFilters.rating = ratingFilter.value;
                this.currentPage = 1;
                this.load();
            });
        }
        
        // Sort by
        const sortSelect = document.getElementById('reviewSortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.currentFilters.sort = sortSelect.value;
                this.currentPage = 1;
                this.load();
            });
        }
        
        // Bulk select all checkbox
        const selectAllCheckbox = document.getElementById('selectAllReviews');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }
        
        // Bulk approve button
        const bulkApproveBtn = document.getElementById('bulkApproveBtn');
        if (bulkApproveBtn) {
            bulkApproveBtn.addEventListener('click', () => {
                this.bulkApproveReviews();
            });
        }
        
        // Bulk reject button
        const bulkRejectBtn = document.getElementById('bulkRejectBtn');
        if (bulkRejectBtn) {
            bulkRejectBtn.addEventListener('click', () => {
                this.bulkRejectReviews();
            });
        }
    },
    
    /**
     * Load reviews data
     */
    async load() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                ...this.currentFilters
            };
            
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.adminReviews, params);
            
            if (data.success) {
                this.renderReviews(data.data || []);
                this.updateBulkActionButtons();
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            Notifications.error('Failed to load reviews');
        }
    },
    
    /**
     * Render reviews table
     */
    renderReviews(reviews) {
        const tbody = document.getElementById('reviewsTableBody');
        if (!tbody) return;
        
        if (reviews.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center">No reviews found</td></tr>';
            this.selectedReviews.clear();
            return;
        }
        
        tbody.innerHTML = reviews.map(review => {
            const isSelected = this.selectedReviews.has(review.id);
            const statusClass = this.getReviewStatusClass(review.status);
            const stars = this.renderStars(review.rating);
            
            return `
            <tr>
                <td>
                    <input type="checkbox" 
                           class="review-checkbox" 
                           data-review-id="${review.id}"
                           ${isSelected ? 'checked' : ''}
                           onchange="ReviewsPanel.toggleReviewSelection('${review.id}', this.checked)">
                </td>
                <td>${Utils.escapeHtml(review.product_name || 'Unknown Product')}</td>
                <td>${Utils.escapeHtml(review.customer_name || 'Anonymous')}</td>
                <td>${stars}</td>
                <td class="review-comment">
                    ${Utils.escapeHtml(Utils.truncate(review.comment, 100))}
                </td>
                <td>${Utils.getStatusBadge(statusClass, Utils.capitalize(review.status))}</td>
                <td>${review.helpful_count || 0}</td>
                <td>${Utils.formatDate(review.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        ${review.status === 'pending' && AdminAuth.hasPermission('approve_reviews') ? `
                        <button class="btn btn-sm btn-success" 
                                onclick="ReviewsPanel.approveReview('${review.id}')"
                                title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" 
                                onclick="ReviewsPanel.rejectReview('${review.id}')"
                                title="Reject">
                            <i class="fas fa-times"></i>
                        </button>
                        ` : ''}
                        ${AdminAuth.hasPermission('flag_reviews') ? `
                        <button class="btn btn-sm btn-warning" 
                                onclick="ReviewsPanel.flagReview('${review.id}')"
                                title="Flag as inappropriate">
                            <i class="fas fa-flag"></i>
                        </button>
                        ` : ''}
                        <button class="btn btn-sm btn-primary" 
                                onclick="ReviewsPanel.viewReviewDetails('${review.id}')"
                                title="View details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    },
    
    /**
     * Render star rating
     */
    renderStars(rating) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push('<i class="fas fa-star" style="color: #ffc107;"></i>');
            } else {
                stars.push('<i class="far fa-star" style="color: #ddd;"></i>');
            }
        }
        return stars.join('');
    },
    
    /**
     * Get review status class for badge
     */
    getReviewStatusClass(status) {
        const statusMap = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger',
            'flagged': 'danger'
        };
        return statusMap[status] || 'secondary';
    },
    
    /**
     * Toggle review selection
     */
    toggleReviewSelection(reviewId, isChecked) {
        if (isChecked) {
            this.selectedReviews.add(reviewId);
        } else {
            this.selectedReviews.delete(reviewId);
        }
        this.updateBulkActionButtons();
    },
    
    /**
     * Toggle select all reviews
     */
    toggleSelectAll(isChecked) {
        const checkboxes = document.querySelectorAll('.review-checkbox');
        checkboxes.forEach(checkbox => {
            const reviewId = checkbox.dataset.reviewId;
            checkbox.checked = isChecked;
            if (isChecked) {
                this.selectedReviews.add(reviewId);
            } else {
                this.selectedReviews.delete(reviewId);
            }
        });
        this.updateBulkActionButtons();
    },
    
    /**
     * Update bulk action buttons state
     */
    updateBulkActionButtons() {
        const bulkApproveBtn = document.getElementById('bulkApproveBtn');
        const bulkRejectBtn = document.getElementById('bulkRejectBtn');
        const selectedCount = document.getElementById('selectedReviewsCount');
        
        const count = this.selectedReviews.size;
        const hasSelection = count > 0;
        
        if (bulkApproveBtn) bulkApproveBtn.disabled = !hasSelection;
        if (bulkRejectBtn) bulkRejectBtn.disabled = !hasSelection;
        if (selectedCount) selectedCount.textContent = count;
    },
    
    /**
     * Approve a single review
     */
    async approveReview(reviewId) {
        if (!confirm('Are you sure you want to approve this review?')) {
            return;
        }
        
        try {
            const endpoint = ADMIN_CONFIG.ENDPOINTS.approveReview(reviewId);
            const data = await API.post(endpoint);
            
            if (data.success) {
                Notifications.success('Review approved successfully');
                await this.load();
            } else {
                Notifications.error(data.message || 'Failed to approve review');
            }
        } catch (error) {
            console.error('Error approving review:', error);
            Notifications.error('Failed to approve review');
        }
    },
    
    /**
     * Reject a single review
     */
    async rejectReview(reviewId) {
        if (!confirm('Are you sure you want to reject this review?')) {
            return;
        }
        
        try {
            const endpoint = ADMIN_CONFIG.ENDPOINTS.rejectReview(reviewId);
            const data = await API.post(endpoint);
            
            if (data.success) {
                Notifications.success('Review rejected successfully');
                await this.load();
            } else {
                Notifications.error(data.message || 'Failed to reject review');
            }
        } catch (error) {
            console.error('Error rejecting review:', error);
            Notifications.error('Failed to reject review');
        }
    },
    
    /**
     * Flag a review as inappropriate
     */
    async flagReview(reviewId) {
        if (!confirm('Are you sure you want to flag this review as inappropriate?')) {
            return;
        }
        
        try {
            const endpoint = ADMIN_CONFIG.ENDPOINTS.flagReview(reviewId);
            const data = await API.post(endpoint);
            
            if (data.success) {
                Notifications.success('Review flagged successfully');
                await this.load();
            } else {
                Notifications.error(data.message || 'Failed to flag review');
            }
        } catch (error) {
            console.error('Error flagging review:', error);
            Notifications.error('Failed to flag review');
        }
    },
    
    /**
     * Bulk approve selected reviews
     */
    async bulkApproveReviews() {
        const count = this.selectedReviews.size;
        if (count === 0) return;
        
        if (!confirm(`Are you sure you want to approve ${count} review(s)?`)) {
            return;
        }
        
        try {
            const reviewIds = Array.from(this.selectedReviews);
            const data = await API.post(ADMIN_CONFIG.ENDPOINTS.adminReviews + '/bulk-approve', {
                reviewIds
            });
            
            if (data.success) {
                Notifications.success(`${count} review(s) approved successfully`);
                this.selectedReviews.clear();
                await this.load();
            } else {
                Notifications.error(data.message || 'Failed to approve reviews');
            }
        } catch (error) {
            console.error('Error bulk approving reviews:', error);
            Notifications.error('Failed to approve reviews');
        }
    },
    
    /**
     * Bulk reject selected reviews
     */
    async bulkRejectReviews() {
        const count = this.selectedReviews.size;
        if (count === 0) return;
        
        if (!confirm(`Are you sure you want to reject ${count} review(s)?`)) {
            return;
        }
        
        try {
            const reviewIds = Array.from(this.selectedReviews);
            const data = await API.post(ADMIN_CONFIG.ENDPOINTS.adminReviews + '/bulk-reject', {
                reviewIds
            });
            
            if (data.success) {
                Notifications.success(`${count} review(s) rejected successfully`);
                this.selectedReviews.clear();
                await this.load();
            } else {
                Notifications.error(data.message || 'Failed to reject reviews');
            }
        } catch (error) {
            console.error('Error bulk rejecting reviews:', error);
            Notifications.error('Failed to reject reviews');
        }
    },
    
    /**
     * View review details in a modal
     */
    async viewReviewDetails(reviewId) {
        try {
            const data = await API.get(`${ADMIN_CONFIG.ENDPOINTS.adminReviews}/${reviewId}`);
            
            if (data.success) {
                this.showReviewModal(data.data);
            } else {
                Notifications.error('Failed to load review details');
            }
        } catch (error) {
            console.error('Error loading review details:', error);
            Notifications.error('Failed to load review details');
        }
    },
    
    /**
     * Show review details modal
     */
    showReviewModal(review) {
        const stars = this.renderStars(review.rating);
        const statusClass = this.getReviewStatusClass(review.status);
        
        const modalContent = `
            <div class="modal-overlay" id="reviewModal" onclick="ReviewsPanel.closeModal(event)">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>Review Details</h3>
                        <button class="modal-close" onclick="ReviewsPanel.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="review-details">
                            <div class="detail-group">
                                <label>Product:</label>
                                <span>${Utils.escapeHtml(review.product_name)}</span>
                            </div>
                            <div class="detail-group">
                                <label>Customer:</label>
                                <span>${Utils.escapeHtml(review.customer_name)} (${Utils.escapeHtml(review.customer_email)})</span>
                            </div>
                            <div class="detail-group">
                                <label>Rating:</label>
                                <span>${stars} (${review.rating}/5)</span>
                            </div>
                            <div class="detail-group">
                                <label>Status:</label>
                                <span>${Utils.getStatusBadge(statusClass, Utils.capitalize(review.status))}</span>
                            </div>
                            <div class="detail-group">
                                <label>Date:</label>
                                <span>${Utils.formatDate(review.created_at)}</span>
                            </div>
                            ${review.order_id ? `
                            <div class="detail-group">
                                <label>Order:</label>
                                <span>#${review.order_id}</span>
                            </div>
                            ` : ''}
                            <div class="detail-group">
                                <label>Helpful Count:</label>
                                <span>${review.helpful_count || 0}</span>
                            </div>
                            <div class="detail-group full-width">
                                <label>Review Comment:</label>
                                <p class="review-comment-full">${Utils.escapeHtml(review.comment)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        ${review.status === 'pending' && AdminAuth.hasPermission('approve_reviews') ? `
                        <button class="btn btn-success" onclick="ReviewsPanel.approveReview('${review.id}'); ReviewsPanel.closeModal();">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-danger" onclick="ReviewsPanel.rejectReview('${review.id}'); ReviewsPanel.closeModal();">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="ReviewsPanel.closeModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalContent);
    },
    
    /**
     * Close modal
     */
    closeModal(event) {
        if (!event || event.target.classList.contains('modal-overlay') || !event.target.closest) {
            const modal = document.getElementById('reviewModal');
            if (modal) {
                modal.remove();
            }
        }
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ReviewsPanel = ReviewsPanel;
}
