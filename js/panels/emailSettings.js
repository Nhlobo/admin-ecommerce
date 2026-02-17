/**
 * Email Settings Panel
 * Manage email notification settings
 */

const EmailSettingsPanel = {
    currentSettings: {},
    
    /**
     * Initialize email settings panel
     */
    async init() {
        this.setupEventListeners();
        await this.load();
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Save settings button
        const saveBtn = document.getElementById('saveEmailSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
        
        // Test email button
        const testBtn = document.getElementById('testEmailBtn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.testEmail();
            });
        }
    },
    
    /**
     * Load email settings
     */
    async load() {
        try {
            const data = await API.get(ADMIN_CONFIG.ENDPOINTS.emailSettings);
            
            if (data.success) {
                this.currentSettings = data.settings || {};
                this.renderSettings(this.currentSettings);
            }
        } catch (error) {
            console.error('Error loading email settings:', error);
            Notifications.error('Failed to load email settings');
        }
    },
    
    /**
     * Render email settings form
     */
    renderSettings(settings) {
        // Order confirmation emails
        const orderConfirmationToggle = document.getElementById('orderConfirmationEnabled');
        if (orderConfirmationToggle) {
            orderConfirmationToggle.checked = settings.orderConfirmation !== false;
        }
        
        // Low stock alerts
        const lowStockToggle = document.getElementById('lowStockAlertsEnabled');
        if (lowStockToggle) {
            lowStockToggle.checked = settings.lowStockAlerts !== false;
        }
        
        const lowStockThreshold = document.getElementById('lowStockThreshold');
        if (lowStockThreshold) {
            lowStockThreshold.value = settings.lowStockThreshold || 5;
        }
        
        // Admin emails
        const adminEmails = document.getElementById('adminEmails');
        if (adminEmails) {
            adminEmails.value = (settings.adminEmails || []).join(', ');
        }
        
        // Return notifications
        const returnNotificationsToggle = document.getElementById('returnNotificationsEnabled');
        if (returnNotificationsToggle) {
            returnNotificationsToggle.checked = settings.returnNotifications !== false;
        }
        
        // New order notifications
        const newOrderToggle = document.getElementById('newOrderNotificationsEnabled');
        if (newOrderToggle) {
            newOrderToggle.checked = settings.newOrderNotifications !== false;
        }
        
        // Review notifications
        const reviewNotificationsToggle = document.getElementById('reviewNotificationsEnabled');
        if (reviewNotificationsToggle) {
            reviewNotificationsToggle.checked = settings.reviewNotifications !== false;
        }
    },
    
    /**
     * Save email settings
     */
    async saveSettings() {
        try {
            const settings = {
                orderConfirmation: document.getElementById('orderConfirmationEnabled')?.checked || false,
                lowStockAlerts: document.getElementById('lowStockAlertsEnabled')?.checked || false,
                lowStockThreshold: parseInt(document.getElementById('lowStockThreshold')?.value || 5),
                adminEmails: (document.getElementById('adminEmails')?.value || '')
                    .split(',')
                    .map(email => email.trim())
                    .filter(email => email.length > 0),
                returnNotifications: document.getElementById('returnNotificationsEnabled')?.checked || false,
                newOrderNotifications: document.getElementById('newOrderNotificationsEnabled')?.checked || false,
                reviewNotifications: document.getElementById('reviewNotificationsEnabled')?.checked || false
            };
            
            const data = await API.post(ADMIN_CONFIG.ENDPOINTS.emailSettings, settings);
            
            if (data.success) {
                Notifications.success('Email settings saved successfully');
                this.currentSettings = settings;
            } else {
                Notifications.error(data.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving email settings:', error);
            Notifications.error('Failed to save email settings');
        }
    },
    
    /**
     * Test email sending
     */
    async testEmail() {
        const testEmailInput = document.getElementById('testEmailAddress');
        const testEmail = testEmailInput?.value;
        
        if (!testEmail) {
            Notifications.warning('Please enter an email address to test');
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(testEmail)) {
            Notifications.error('Please enter a valid email address');
            return;
        }
        
        try {
            Notifications.info('Sending test email...');
            
            const data = await API.post(ADMIN_CONFIG.ENDPOINTS.testEmail, {
                email: testEmail
            });
            
            if (data.success) {
                Notifications.success('Test email sent successfully');
            } else {
                Notifications.error(data.message || 'Failed to send test email');
            }
        } catch (error) {
            console.error('Error sending test email:', error);
            Notifications.error('Failed to send test email');
        }
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.EmailSettingsPanel = EmailSettingsPanel;
}
