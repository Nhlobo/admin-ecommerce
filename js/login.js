/**
 * Admin Login Script
 */

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loadingOverlay = document.getElementById('globalLoadingOverlay');
    const loadingText = document.getElementById('globalLoadingText');

    const setLoading = (isLoading, text = 'Connecting securely...') => {
        if (!loadingOverlay) return;
        loadingOverlay.style.display = isLoading ? 'flex' : 'none';
        if (loadingText) loadingText.textContent = text;
    };

    // Check if already logged in
    const token = localStorage.getItem(ADMIN_CONFIG.TOKEN_KEY);
    if (token) {
        window.location.href = '/dashboard';
        return;
    }

    // Warm up sleeping backend without exposing infra messages to admins
    setLoading(true, 'Connecting to admin services...');
    await waitForBackendWakeup();
    setLoading(false);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailOrUsername = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        errorMessage.style.display = 'none';
        errorMessage.textContent = '';

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        setLoading(true, 'Signing you in...');

        try {
            const response = await fetch(getApiUrl(ADMIN_CONFIG.ENDPOINTS.login), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailOrUsername,
                    username: emailOrUsername,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            localStorage.setItem(ADMIN_CONFIG.TOKEN_KEY, data.data.token);
            localStorage.setItem(ADMIN_CONFIG.ADMIN_INFO_KEY, JSON.stringify(data.data.admin));

            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Login error:', error);
            const friendlyMessage = error.message === 'Failed to fetch'
                ? 'Unable to reach the server right now. Please wait a moment and try again.'
                : error.message;

            errorMessage.textContent = friendlyMessage;
            errorMessage.style.display = 'block';

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            setLoading(false);
        }
    });
});
