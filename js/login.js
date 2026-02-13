/**
 * Admin Login Script
 * Handles authentication for admin dashboard
 */

const API_BASE = ADMIN_CONFIG.API_BASE_URL;

function setLoadingState(isLoading, message = 'Connecting to secure server...') {
    const overlay = document.getElementById('globalLoadingOverlay');
    const loadingText = document.getElementById('globalLoadingText');
    if (!overlay) return;

    if (loadingText) {
        loadingText.textContent = message;
    }

    overlay.classList.toggle('active', isLoading);
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
        // If we have a token, redirect to dashboard
        // Token validation will happen on the dashboard page
        window.location.href = '/dashboard';
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
        setLoadingState(true, 'Signing in...');
        
        try {
            const response = await fetchWithRetry(`${API_BASE}${getAdminApiEndpoint('/admin/login')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            }, {
                retries: 3,
                retryDelayMs: 2500,
                timeoutMs: 90000
            });
            
            const data = await response.json().catch(() => ({}));
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            // Store token and admin info
            localStorage.setItem('adminToken', data.data.token);
            localStorage.setItem('adminInfo', JSON.stringify(data.data.admin));
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
            
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = error.name === 'AbortError'
                ? 'The server is taking too long to wake up. Please try again.'
                : (error.message || 'Unable to connect to server. Please try again.');
            errorMessage.style.display = 'block';
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        } finally {
            setLoadingState(false);
        }
    });
});
