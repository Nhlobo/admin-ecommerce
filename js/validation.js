/**
 * Form Validation Module
 * Client-side validation for all forms
 */

const Validation = {
    /**
     * Validate email
     */
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        return { valid: true };
    },
    
    /**
     * Validate required field
     */
    required(value, fieldName = 'This field') {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return { valid: false, message: `${fieldName} is required` };
        }
        return { valid: true };
    },
    
    /**
     * Validate minimum length
     */
    minLength(value, min, fieldName = 'This field') {
        if (!value || value.length < min) {
            return { valid: false, message: `${fieldName} must be at least ${min} characters` };
        }
        return { valid: true };
    },
    
    /**
     * Validate maximum length
     */
    maxLength(value, max, fieldName = 'This field') {
        if (value && value.length > max) {
            return { valid: false, message: `${fieldName} must not exceed ${max} characters` };
        }
        return { valid: true };
    },
    
    /**
     * Validate number
     */
    number(value, fieldName = 'This field') {
        if (isNaN(value)) {
            return { valid: false, message: `${fieldName} must be a number` };
        }
        return { valid: true };
    },
    
    /**
     * Validate positive number
     */
    positiveNumber(value, fieldName = 'This field') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
            return { valid: false, message: `${fieldName} must be a positive number` };
        }
        return { valid: true };
    },
    
    /**
     * Validate min value
     */
    min(value, min, fieldName = 'This field') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < min) {
            return { valid: false, message: `${fieldName} must be at least ${min}` };
        }
        return { valid: true };
    },
    
    /**
     * Validate max value
     */
    max(value, max, fieldName = 'This field') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue > max) {
            return { valid: false, message: `${fieldName} must not exceed ${max}` };
        }
        return { valid: true };
    },
    
    /**
     * Validate date
     */
    date(dateString, fieldName = 'Date') {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return { valid: false, message: `${fieldName} is invalid` };
        }
        return { valid: true };
    },
    
    /**
     * Validate future date
     */
    futureDate(dateString, fieldName = 'Date') {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return { valid: false, message: `${fieldName} is invalid` };
        }
        if (date <= new Date()) {
            return { valid: false, message: `${fieldName} must be in the future` };
        }
        return { valid: true };
    },
    
    /**
     * Validate percentage (0-100)
     */
    percentage(value, fieldName = 'Percentage') {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            return { valid: false, message: `${fieldName} must be between 0 and 100` };
        }
        return { valid: true };
    },
    
    /**
     * Validate discount code
     */
    discountCode(code) {
        if (!code || code.length < 3) {
            return { valid: false, message: 'Discount code must be at least 3 characters' };
        }
        if (!/^[A-Z0-9-_]+$/.test(code)) {
            return { valid: false, message: 'Discount code can only contain uppercase letters, numbers, hyphens, and underscores' };
        }
        return { valid: true };
    },
    
    /**
     * Validate phone number (South African format)
     */
    phone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length !== 10 && cleaned.length !== 11) {
            return { valid: false, message: 'Please enter a valid phone number' };
        }
        return { valid: true };
    },
    
    /**
     * Validate form
     * @param {Object} rules - Validation rules { fieldName: [{ rule: 'required' }, ...] }
     * @param {Object} values - Form values { fieldName: value }
     * @returns {Object} - { valid: boolean, errors: { fieldName: message } }
     */
    validateForm(rules, values) {
        const errors = {};
        let valid = true;
        
        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = values[field];
            
            for (const ruleConfig of fieldRules) {
                const { rule, ...params } = ruleConfig;
                let result;
                
                switch (rule) {
                    case 'required':
                        result = this.required(value, params.fieldName || field);
                        break;
                    case 'email':
                        if (value) result = this.email(value);
                        break;
                    case 'minLength':
                        if (value) result = this.minLength(value, params.min, params.fieldName || field);
                        break;
                    case 'maxLength':
                        if (value) result = this.maxLength(value, params.max, params.fieldName || field);
                        break;
                    case 'number':
                        if (value) result = this.number(value, params.fieldName || field);
                        break;
                    case 'positiveNumber':
                        if (value) result = this.positiveNumber(value, params.fieldName || field);
                        break;
                    case 'min':
                        if (value) result = this.min(value, params.min, params.fieldName || field);
                        break;
                    case 'max':
                        if (value) result = this.max(value, params.max, params.fieldName || field);
                        break;
                    case 'percentage':
                        if (value) result = this.percentage(value, params.fieldName || field);
                        break;
                    case 'discountCode':
                        if (value) result = this.discountCode(value);
                        break;
                    case 'phone':
                        if (value) result = this.phone(value);
                        break;
                    default:
                        result = { valid: true };
                }
                
                if (result && !result.valid) {
                    errors[field] = result.message;
                    valid = false;
                    break;
                }
            }
        }
        
        return { valid, errors };
    },
    
    /**
     * Display validation errors on form
     */
    displayErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Display new errors
        for (const [field, message] of Object.entries(errors)) {
            const input = document.getElementById(field) || 
                         document.querySelector(`[name="${field}"]`);
            
            if (input) {
                input.classList.add('error');
                const errorEl = document.createElement('div');
                errorEl.className = 'field-error';
                errorEl.textContent = message;
                input.parentNode.insertBefore(errorEl, input.nextSibling);
            }
        }
    },
    
    /**
     * Clear validation errors
     */
    clearErrors() {
        document.querySelectorAll('.field-error').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Validation = Validation;
}
