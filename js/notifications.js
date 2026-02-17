/**
 * Notifications Module
 * Toast notifications and confirmation dialogs
 */

const Notifications = {
    /**
     * Show a notification
     */
    show(message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    },
    
    /**
     * Success notification
     */
    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    },
    
    /**
     * Error notification
     */
    error(message, duration = 5000) {
        this.show(message, 'error', duration);
    },
    
    /**
     * Warning notification
     */
    warning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    },
    
    /**
     * Info notification
     */
    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    },
    
    /**
     * Confirmation dialog
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback on confirm
     * @param {Function} onCancel - Callback on cancel (optional)
     */
    confirm(message, onConfirm, onCancel = null) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('confirmModal');
        if (!modal) {
            modal = this.createConfirmModal();
        }
        
        const messageEl = modal.querySelector('.confirm-message');
        const confirmBtn = modal.querySelector('.confirm-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        
        messageEl.textContent = message;
        
        // Remove old event listeners by cloning
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        // Add new event listeners
        newConfirmBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (onConfirm) onConfirm();
        });
        
        newCancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (onCancel) onCancel();
        });
        
        modal.style.display = 'flex';
    },
    
    /**
     * Create confirmation modal
     */
    createConfirmModal() {
        const modal = document.createElement('div');
        modal.id = 'confirmModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h3>Confirm Action</h3>
                </div>
                <div class="modal-body">
                    <p class="confirm-message"></p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-btn">Cancel</button>
                    <button class="btn btn-danger confirm-btn">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        return modal;
    },
    
    /**
     * Prompt dialog
     * @param {string} message - Prompt message
     * @param {string} defaultValue - Default input value
     * @param {Function} onSubmit - Callback with input value
     */
    prompt(message, defaultValue = '', onSubmit) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('promptModal');
        if (!modal) {
            modal = this.createPromptModal();
        }
        
        const messageEl = modal.querySelector('.prompt-message');
        const input = modal.querySelector('.prompt-input');
        const submitBtn = modal.querySelector('.submit-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        
        messageEl.textContent = message;
        input.value = defaultValue;
        
        // Remove old event listeners by cloning
        const newSubmitBtn = submitBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        // Add new event listeners
        newSubmitBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (onSubmit) onSubmit(input.value);
        });
        
        newCancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.style.display = 'flex';
        input.focus();
    },
    
    /**
     * Create prompt modal
     */
    createPromptModal() {
        const modal = document.createElement('div');
        modal.id = 'promptModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content prompt-modal">
                <div class="modal-header">
                    <h3>Input Required</h3>
                </div>
                <div class="modal-body">
                    <p class="prompt-message"></p>
                    <input type="text" class="form-input prompt-input">
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-btn">Cancel</button>
                    <button class="btn btn-primary submit-btn">Submit</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        return modal;
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Notifications = Notifications;
}
