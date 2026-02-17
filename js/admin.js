/**
 * Admin Dashboard Script
 * Main functionality for admin dashboard
 */

const API_BASE = ADMIN_CONFIG.API_BASE_URL;
let adminToken = null;
let adminInfo = null;

function setLoadingState(isLoading, message = 'Loading admin dashboard...') {
    const overlay = document.getElementById('globalLoadingOverlay');
    const loadingText = document.getElementById('globalLoadingText');
    if (!overlay) return;

    if (loadingText) {
        loadingText.textContent = message;
    }

    overlay.classList.toggle('active', isLoading);
}

// ================================
// INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', async () => {
    const RETRY_RELOAD_DELAY_MS = 5000;
    const ERROR_REDIRECT_DELAY_MS = 2000;
    
    // Check authentication (check both localStorage and sessionStorage)
    adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = '/login';
        return;
    }
    
    const storedAdminInfo = localStorage.getItem('adminInfo') || sessionStorage.getItem('adminInfo');
    if (storedAdminInfo) {
        adminInfo = JSON.parse(storedAdminInfo);
        document.getElementById('adminName').textContent = adminInfo.fullName || adminInfo.email;
    }
    
    setLoadingState(true, 'Connecting to admin services...');

    // Verify token and check backend availability
    try {
        const verifyResponse = await fetchWithRetry(`${API_BASE}/api/admin/verify`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        }, {
            retries: 3,
            retryDelayMs: 3000,
            timeoutMs: 90000
        });
        
        if (!verifyResponse.ok) {
            // Token invalid, redirect to login
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            window.location.href = '/login';
            return;
        }
        
        // Initialize dashboard
        initializeDashboard();
        
        // Setup session timeout
        AdminAuth.setupSessionTimeout();
        
        // Apply role-based restrictions
        AdminAuth.applyRoleRestrictions();
        
        // Event listeners
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
        document.getElementById('mobileSidebarToggle').addEventListener('click', toggleSidebar);
        
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const panel = item.dataset.panel;
                showPanel(panel);
            });
        });
        
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                switchTab(tab);
            });
        });
        
        // Load initial data
        await OverviewPanel.loadData();
        
        setLoadingState(false);
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        setLoadingState(false);
        
        if (error.message.includes('timeout') || error.name === 'AbortError') {
            showNotification('Server is starting up. Please wait a moment...', 'warning');
            // Retry after delay
            setTimeout(() => window.location.reload(), RETRY_RELOAD_DELAY_MS);
        } else {
            showNotification('Connection error. Redirecting to login...', 'error');
            setTimeout(() => {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminInfo');
                window.location.href = '/login';
            }, ERROR_REDIRECT_DELAY_MS);
        }
    }
});

// ================================
// API HELPER FUNCTIONS
// ================================

async function apiRequest(endpoint, options = {}) {
    try {
        return await API.request(endpoint, options);
    } catch (error) {
        const errorMessage = error.name === 'AbortError'
            ? 'Server is waking up. Please wait and try again.'
            : error.message;
        showNotification(errorMessage, 'error');
        throw error;
    }
}

// ================================
// NAVIGATION & UI
// ================================

function initializeDashboard() {
    // Show the overview panel by default without double-fetching data
    showPanel('overview', { skipLoad: true });
}

function showPanel(panelName, options = {}) {
    // Hide all panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show selected panel
    const panel = document.getElementById(`${panelName}Panel`);
    if (panel) {
        panel.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    const navItem = document.querySelector(`.nav-item[data-panel="${panelName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'overview': 'Dashboard Overview',
        'orders': 'Orders Management',
        'payments': 'Payments Management',
        'customers': 'Customers Management',
        'products': 'Products & Inventory',
        'discounts': 'Discounts & Promotions',
        'returns': 'Returns & Refunds',
        'reports': 'Reports & Analytics',
        'compliance': 'Compliance & Legal',
        'logs': 'Security & Logs'
    };
    document.getElementById('pageTitle').textContent = titles[panelName] || 'Dashboard';
    
    // Load panel data
    if (!options.skipLoad) {
        loadPanelData(panelName);
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function showNotification(message, type = 'info') {
    Notifications.show(message, type);
}

// ================================
// PANEL LOADING
// ================================

function loadPanelData(panelName) {
    const panelMap = {
        'overview': OverviewPanel,
        'orders': OrdersPanel,
        'payments': PaymentsPanel,
        'customers': CustomersPanel,
        'products': ProductsPanel,
        'discounts': DiscountsPanel,
        'returns': ReturnsPanel,
        'reports': ReportsPanel,
        'compliance': CompliancePanel,
        'logs': SecurityLogsPanel
    };
    
    const panel = panelMap[panelName];
    if (panel && panel.init) {
        panel.init();
    }
}

// ================================
// LOGOUT
// ================================

async function handleLogout() {
    await AdminAuth.logout();
}
