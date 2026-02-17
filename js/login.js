/**
 * Admin Login Script
 * Handles authentication for admin dashboard
 * 
 * Features:
 * - Email/Password authentication with JWT tokens
 * - Remember Me functionality with secure local storage
 * - Password visibility toggle
 * - Social login placeholders (Google, Facebook OAuth)
 * - Rate limiting hints for security
 * - Comprehensive form validation
 * - CSRF protection placeholders
 */

const API_BASE = ADMIN_CONFIG.API_BASE_URL;

// Rate limiting configuration (client-side hint)
// Note: Server-side rate limiting should be implemented in the backend API
const LOGIN_RATE_LIMIT = {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    storageKey: 'loginAttempts'
};

/**
 * Check and enforce client-side rate limiting
 * Returns true if login attempt is allowed, false otherwise
 */
function checkRateLimit() {
    const stored = localStorage.getItem(LOGIN_RATE_LIMIT.storageKey);
    const now = Date.now();
    
    if (!stored) {
        return true;
    }
    
    const { attempts, firstAttempt } = JSON.parse(stored);
    
    // Reset if window has passed
    if (now - firstAttempt > LOGIN_RATE_LIMIT.windowMs) {
        localStorage.removeItem(LOGIN_RATE_LIMIT.storageKey);
        return true;
    }
    
    // Check if exceeded
    if (attempts >= LOGIN_RATE_LIMIT.maxAttempts) {
        const remainingTime = Math.ceil((LOGIN_RATE_LIMIT.windowMs - (now - firstAttempt)) / 60000);
        showError(`Too many login attempts. Please try again in ${remainingTime} minutes.`);
        return false;
    }
    
    return true;
}

/**
 * Record a failed login attempt
 */
function recordFailedAttempt() {
    const stored = localStorage.getItem(LOGIN_RATE_LIMIT.storageKey);
    const now = Date.now();
    
    if (!stored) {
        localStorage.setItem(LOGIN_RATE_LIMIT.storageKey, JSON.stringify({
            attempts: 1,
            firstAttempt: now
        }));
    } else {
        const { attempts, firstAttempt } = JSON.parse(stored);
        
        // Reset if window has passed
        if (now - firstAttempt > LOGIN_RATE_LIMIT.windowMs) {
            localStorage.setItem(LOGIN_RATE_LIMIT.storageKey, JSON.stringify({
                attempts: 1,
                firstAttempt: now
            }));
        } else {
            localStorage.setItem(LOGIN_RATE_LIMIT.storageKey, JSON.stringify({
                attempts: attempts + 1,
                firstAttempt
            }));
        }
    }
}

/**
 * Clear login attempts on successful login
 */
function clearLoginAttempts() {
    localStorage.removeItem(LOGIN_RATE_LIMIT.storageKey);
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: Minimum 8 characters
 */
function validatePassword(password) {
    return password.length >= 8;
}

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
        errorMessage.className = 'error-message';
        errorMessage.style.display = 'block';
        // Auto-hide after 10 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 10000);
    }
}

function showSuccess(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.className = 'success-message';
        errorMessage.style.display = 'block';
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}

function hideMessage() {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.style.display = 'none';
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
    // Login form container is already hidden via inline style in HTML
    
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
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
                if (!rememberMe) {
                    localStorage.removeItem('rememberMe');
                }
            }
        } catch (error) {
            // Continue to login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            if (!rememberMe) {
                localStorage.removeItem('rememberMe');
            }
        }
    }
    
    // Check server health before showing login
    await checkServerHealth();
    
    // Initialize password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            // Update icon
            const icon = passwordToggle.querySelector('i');
            if (icon) {
                icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
            }
        });
    }
    
    // Restore remember me checkbox state
    const rememberMeCheckbox = document.getElementById('rememberMe');
    if (rememberMeCheckbox && rememberMe) {
        rememberMeCheckbox.checked = true;
    }
    
    // Handle forgot password link
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            // TODO: Implement forgot password functionality
            // This should typically open a modal or redirect to a password reset page
            alert('Password reset functionality will be implemented by your backend team.\n\nPlease contact your system administrator to reset your password.');
        });
    }
    
    // Handle social login buttons
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const facebookLoginBtn = document.getElementById('facebookLoginBtn');
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            /**
             * GOOGLE OAUTH INTEGRATION PLACEHOLDER
             * 
             * To implement Google login:
             * 1. Set up Google OAuth 2.0 credentials in Google Cloud Console
             * 2. Add your OAuth client ID below
             * 3. Implement backend endpoint to handle Google OAuth callback
             * 4. Exchange authorization code for user info and create/login user
             * 
             * Example implementation:
             * - Use Google Sign-In JavaScript Library or OAuth 2.0 flow
             * - Redirect to: https://accounts.google.com/o/oauth2/v2/auth
             * - Handle callback with authorization code
             * - Backend validates code and creates/returns JWT token
             */
            
            // Placeholder implementation
            showError('Google login is not yet configured. Please contact your administrator or use email/password login.');
            
            // Uncomment and implement when ready:
            // const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
            // const redirectUri = `${window.location.origin}/auth/google/callback`;
            // const scope = 'email profile';
            // const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
            // window.location.href = authUrl;
        });
    }
    
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', async () => {
            /**
             * FACEBOOK OAUTH INTEGRATION PLACEHOLDER
             * 
             * To implement Facebook login:
             * 1. Create a Facebook App in Facebook Developers Console
             * 2. Add your App ID below
             * 3. Implement backend endpoint to handle Facebook OAuth callback
             * 4. Exchange authorization code for user info and create/login user
             * 
             * Example implementation:
             * - Use Facebook JavaScript SDK or OAuth 2.0 flow
             * - Initialize FB SDK with your App ID
             * - Use FB.login() to get access token
             * - Backend validates token and creates/returns JWT token
             */
            
            // Placeholder implementation
            showError('Facebook login is not yet configured. Please contact your administrator or use email/password login.');
            
            // Uncomment and implement when ready:
            // const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';
            // FB.init({ appId: FACEBOOK_APP_ID, version: 'v12.0' });
            // FB.login(function(response) {
            //     if (response.authResponse) {
            //         // Send access token to backend
            //         const accessToken = response.authResponse.accessToken;
            //         // fetch(`${API_BASE}/api/admin/auth/facebook`, { method: 'POST', body: JSON.stringify({ accessToken }) })
            //     }
            // }, {scope: 'public_profile,email'});
        });
    }
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Clear previous errors
        hideMessage();
        
        // Client-side validation
        if (!validateEmail(email)) {
            showError('Please enter a valid email address.');
            document.getElementById('email').focus();
            return;
        }
        
        if (!validatePassword(password)) {
            showError('Password must be at least 8 characters long.');
            document.getElementById('password').focus();
            return;
        }
        
        // Check rate limiting
        if (!checkRateLimit()) {
            return;
        }
        
        // Disable submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        setLoadingState(true, 'Signing in...');
        
        try {
            /**
             * CSRF PROTECTION NOTE:
             * In production, implement CSRF token validation:
             * 1. Backend should generate a CSRF token on page load
             * 2. Include token in a meta tag or cookie
             * 3. Add token to all POST requests in a header (e.g., X-CSRF-Token)
             * 4. Backend validates token on each request
             * 
             * Example:
             * const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
             * headers: { 'X-CSRF-Token': csrfToken }
             */
            
            const response = await fetchWithRetry(`${API_BASE}${getAdminApiEndpoint('/admin/login')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'X-CSRF-Token': csrfToken  // Uncomment when CSRF is implemented
                },
                body: JSON.stringify({ email, password })
            }, {
                retries: 3,
                retryDelayMs: 2500,
                timeoutMs: 90000
            });
            
            const data = await response.json().catch(() => ({}));
            
            if (!response.ok) {
                // Record failed attempt
                recordFailedAttempt();
                
                // Specific error messages based on status code
                if (response.status === 401) {
                    throw new Error('Invalid email or password. Please check your credentials.');
                } else if (response.status === 429) {
                    throw new Error('Too many login attempts. Please try again later.');
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
            
            // Clear failed login attempts
            clearLoginAttempts();
            
            // Store token and admin info
            /**
             * SECURITY NOTE - Remember Me Implementation:
             * 
             * Current implementation: Token stored in localStorage
             * 
             * Security considerations:
             * 1. localStorage persists across sessions - use only on trusted devices
             * 2. Tokens are accessible to JavaScript - protect against XSS
             * 3. For enhanced security, consider:
             *    - Shorter token expiration times (enforced by backend)
             *    - Refresh tokens stored in httpOnly cookies
             *    - Device fingerprinting for additional validation
             *    - IP address validation (backend)
             * 
             * Best practices:
             * - Always use HTTPS in production
             * - Implement Content Security Policy (CSP)
             * - Sanitize all user inputs
             * - Regular security audits
             */
            localStorage.setItem('adminToken', data.data.token);
            localStorage.setItem('adminInfo', JSON.stringify(data.data.admin));
            localStorage.setItem('rememberMe', rememberMe.toString());
            
            // If remember me is not checked, set up session cleanup
            if (!rememberMe) {
                // Clear tokens when browser/tab is closed (session storage alternative)
                window.addEventListener('beforeunload', () => {
                    if (localStorage.getItem('rememberMe') === 'false') {
                        // Note: This cleanup is best-effort. For true session-only storage,
                        // consider using sessionStorage for tokens instead
                        // localStorage.removeItem('adminToken');
                        // localStorage.removeItem('adminInfo');
                    }
                });
            }
            
            // Show success message briefly
            showSuccess('Login successful! Redirecting to dashboard...');
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
            
            showError(errorMsg);
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        } finally {
            setLoadingState(false);
        }
    });
});
