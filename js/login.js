/**
 * Admin Login Script
 * Handles authentication for admin dashboard
 */

const API_BASE = ADMIN_CONFIG.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
        window.location.href = '/admin/index.html';
        return;
    }
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Clear previous errors
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        
        // Disable submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        
        try {
            const response = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            // Store token and admin info
            localStorage.setItem('adminToken', data.data.token);
            localStorage.setItem('adminInfo', JSON.stringify(data.data.admin));
            
            // Redirect to dashboard
            window.location.href = '/admin/index.html';
            
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    });
});
