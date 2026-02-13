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

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

async function checkServerHealth() {
    const maxAttempts = 10;
    const delayBetweenAttempts = 3000; // 3 seconds
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            setLoadingState(true, `Connecting to server... (Attempt ${attempt}/${maxAttempts})`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${API_BASE}/health`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                setLoadingState(true, 'Server ready! Loading login page...');
                await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
                setLoadingState(false);
                
                // Show the login form
                document.getElementById('loginFormContainer').style.display = 'block';
                return true;
            }
        } catch (error) {
            if (attempt < maxAttempts) {
                setLoadingState(true, `Server is waking up... Retrying in ${delayBetweenAttempts/1000} seconds (${attempt}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
            } else {
                setLoadingState(false);
                showError('Unable to connect to server after multiple attempts. Please refresh the page or contact support.');
                return false;
            }
        }
    }
    return false;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Hide login form initially
    const loginFormContainer = document.getElementById('loginFormContainer');
    loginFormContainer.style.display = 'none';
    
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
        setLoadingState(true, 'Verifying session...');
        // Verify token is still valid
        try {
            const response = await fetch(`${API_BASE}/api/admin/verify`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                window.location.href = '/dashboard';
                return;
            } else {
                // Token expired, clear it
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminInfo');
            }
        } catch (error) {
            // Continue to login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
        }
    }
    
    // Check server health before showing login
    await checkServerHealth();
    
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
                // Specific error messages based on status code
                if (response.status === 401) {
                    throw new Error('Invalid email or password. Please check your credentials.');
                } else if (response.status === 503) {
                    throw new Error('Server is temporarily unavailable. Please wait a moment and try again.');
                } else if (response.status === 500) {
                    throw new Error(data.message || 'Server error. Please contact support if this persists.');
                } else {
                    throw new Error(data.message || 'Login failed. Please try again.');
                }
            }
            
            // Validate response data
            if (!data.data || !data.data.token || !data.data.admin) {
                throw new Error('Invalid response from server. Please try again or contact support.');
            }
            
            // Store token and admin info
            localStorage.setItem('adminToken', data.data.token);
            localStorage.setItem('adminInfo', JSON.stringify(data.data.admin));
            
            // Show success message briefly
            setLoadingState(true, 'Login successful! Redirecting...');
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Redirect to dashboard
            window.location.href = '/dashboard';
            
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMsg;
            if (error.name === 'AbortError' || error.message.includes('timeout')) {
                errorMsg = 'Connection timeout. The server may be starting up. Please wait 30 seconds and try again.';
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMsg = 'Network error. Please check your internet connection and try again.';
            } else {
                errorMsg = error.message || 'Unable to connect to server. Please try again.';
            }
            
            errorMessage.textContent = errorMsg;
            errorMessage.style.display = 'block';
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        } finally {
            setLoadingState(false);
        }
    });
});
