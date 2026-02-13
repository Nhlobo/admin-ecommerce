# Premium Hair Wigs & Extensions - Admin Dashboard

This is the secure admin dashboard for managing the Premium Hair Wigs & Extensions e-commerce platform.

## 🔄 Authentication Flow

The admin dashboard implements a secure client-side authentication flow:

1. **Initial Access**: When users first visit the site (`/`), they are presented with the login page
2. **Login**: Users enter their credentials, which are verified against the backend API
3. **Token Storage**: Upon successful authentication, a JWT token is stored in localStorage
4. **Dashboard Access**: Authenticated users are redirected to `/dashboard` where they can access admin features
5. **Token Validation**: All API requests include the JWT token for authentication
6. **Session Management**: If the token expires or is invalid, users are automatically redirected to login

### URL Structure

- `/` or `/login` - Login page (default landing page)
- `/dashboard` - Main admin dashboard (requires authentication)

The Express server handles routing to ensure:
- Unauthenticated users land on the login page
- Static assets (CSS, JS) are served correctly
- Browser refreshes work properly on any route

## 🚀 Features

- 🔐 Secure JWT authentication
- 📊 Real-time business metrics dashboard
- 📦 Orders management with status tracking
- 💳 Payments and refunds management
- 👥 Customer management (POPIA compliant)
- 📦 Products and inventory management
- 🎟️ Discounts and promotions
- ↩️ Returns and refunds processing
- 📈 Sales reports and analytics
- 🔐 Security and activity logs

## 📁 Structure

```
admin-ecommerce/
├── index.html          # Main admin dashboard
├── login.html          # Admin login page
├── server.js           # Express server with security
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── css/
│   └── admin.css       # Admin dashboard styles
└── js/
    ├── config.js       # API configuration
    ├── login.js        # Login authentication
    └── admin.js        # Dashboard functionality
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- npm or yarn

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nhlobo/admin-ecommerce.git
   cd admin-ecommerce
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   
   Or with nodemon for auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the dashboard**:
   - Open browser to: `http://localhost:3000`
   - Login page: `http://localhost:3000/login`
   - Dashboard: `http://localhost:3000/dashboard`

### Production Deployment

See the [Deployment to Render](#-deployment-to-render) section below.

## 🔧 Configuration

The admin dashboard is configured to automatically detect the environment and connect to the appropriate backend API.

### API Configuration (Automatic)

The API configuration is managed in `js/config.js` and automatically detects the environment:

- **Development** (localhost): Connects to `http://localhost:3000`
- **Production** (deployed): Connects to `https://backend-ecommerce-3-2jsk.onrender.com`

To change the production backend URL, edit `js/config.js`:

```javascript
const ADMIN_CONFIG = {
    API_PREFIX: '/api',
    // Update the production URL below
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'  // Development
        : 'https://your-backend-url.onrender.com',  // Production - Update this URL
    // ... rest of config
};
```

## 🌐 Deployment to Render

### Quick Deployment (Recommended)

This repository is configured for easy deployment to Render using `render.yaml`:

1. **Push code to GitHub** (already done)
2. **Go to Render Dashboard**: https://dashboard.render.com/
3. **Click "New +"** → **"Blueprint"** or connect as a **"Web Service"**
4. **Connect your repository**: `Nhlobo/admin-ecommerce`
5. **Render auto-detects `render.yaml`** and configures everything
6. **Click "Apply"** or "Create Web Service"
7. **Done!** Your admin dashboard will be live at: `https://admin-ecommerce-o3id.onrender.com`

### Backend Connection
The admin dashboard connects to the backend API at:
- **Development**: `http://localhost:3000`
- **Production**: `https://backend-ecommerce-3-2jsk.onrender.com`

Configuration is automatic via `js/config.js` which detects the environment.

### Manual Deployment (Alternative)

If you prefer manual configuration:

### Step 1: Prepare Admin for Deployment

1. **Create a simple Express server** to serve the admin files:

Create `server.js` in the `admin-ecommerce` directory:

```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Route all requests to index.html for SPA behavior
app.get('*', (req, res) => {
    if (req.path.endsWith('.html') || req.path.endsWith('.css') || req.path.endsWith('.js')) {
        res.sendFile(path.join(__dirname, req.path));
    } else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Admin dashboard running on port ${PORT}`);
});
```

2. **Create `package.json`**:

```json
{
  "name": "premium-hair-admin-dashboard",
  "version": "1.0.0",
  "description": "Admin Dashboard for Premium Hair E-commerce",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=14.0.0"
  }
```

3. **Configure Backend URL**: If needed, update the production backend URL in `js/config.js` (automatic environment detection is already configured).

### Step 2: Push to GitHub

1. **Create a new repository** for the admin:
   ```bash
   # In the admin-ecommerce directory
   git init
   git add .
   git commit -m "Initial admin dashboard commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ecommerce-admin.git
   git push -u origin main
   ```

### Step 3: Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +"** and select **"Web Service"**
3. **Connect Your Repository**:
   - Select your `ecommerce-admin` repository
   - Click "Connect"
4. **Configure Web Service**:
   - **Name**: `premium-hair-admin`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: Leave empty or set to `.`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose appropriate plan (Free tier available)
5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   BACKEND_URL=https://premium-hair-backend.onrender.com
   ```
6. **Click "Create Web Service"**
7. **Wait for Deployment**
8. **Your Admin Dashboard will be available at**: `https://premium-hair-admin.onrender.com`

### Alternative: Deploy Using render.yaml

This repository includes a `render.yaml` configuration file for easier deployment:

1. **Connect Repository to Render**
2. **Render will automatically detect the `render.yaml` file**
3. **Configuration includes**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js
   - Environment Variables: `NODE_ENV=production`

This is the **recommended method** as it ensures consistent deployments.

### Step 4: Update Backend CORS

After deploying the admin, update your backend's CORS configuration to allow requests from the admin URL:

In your backend `.env`:
```
ADMIN_URL=https://admin-ecommerce-o3id.onrender.com
```

Update backend `server.js` CORS configuration:
```javascript
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        'https://admin-ecommerce-o3id.onrender.com'
    ],
    credentials: true
}));
```

## 🔐 Security Features

This application implements multiple layers of security:

### Server-Level Security
- **Helmet.js**: Adds security headers (CSP, X-Frame-Options, etc.)
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents brute force and DDoS attacks
- **Request Body Parsing**: Size limits to prevent DoS
- **Static File Security**: Blocks access to sensitive files (.env, package.json, etc.)
- **Graceful Shutdown**: Proper cleanup on termination

### Application Security
- **Environment Variables**: Sensitive configuration kept out of code
- **Input Validation**: All user inputs validated
- **Logging**: Request/response logging with timestamps
- **Error Handling**: Global error handler with proper logging
- **Health Check**: Endpoint for monitoring application status

### Authentication & Authorization
- This is a **frontend-only** application serving static files
- All authentication and authorization is handled by the **backend API**
- JWT tokens are stored in localStorage and sent with each API request
- The backend API implements:
  - Rate limiting on API endpoints
  - Brute force protection for login attempts
  - Token expiration and validation
  - Secure password hashing (bcrypt)
  - Activity logging and monitoring

### Security Best Practices

### 1. Change Default Admin Password
After first login, immediately change the default admin password in the backend.

### 2. Use Strong JWT Secret
Generate a strong JWT secret (32+ characters) in your backend.

### 3. Enable HTTPS
Render automatically provides SSL certificates for your custom domain.

### 4. Regular Security Audits
- Monitor security logs regularly
- Review activity logs
- Check for unauthorized access attempts
- Keep dependencies updated

### 5. Restrict Access
Consider adding IP whitelisting for admin access if you have a fixed IP address.

## 📊 Admin Dashboard Panels

### 1. Overview Dashboard
- Real-time metrics
- Today's orders and revenue
- Low stock alerts
- Recent transactions

### 2. Orders Management
- View all orders
- Filter by status
- Update order status
- Add tracking numbers

### 3. Payments Management
- View all payments
- Track payment status
- Process refunds
- PayFast integration

### 4. Customers Management
- View customer list
- Customer profiles
- Order history
- POPIA compliant data access

### 5. Products & Inventory
- Add/Edit/Delete products
- Manage stock levels
- VAT-inclusive pricing
- Category management

### 6. Discounts & Promotions
- Create discount codes
- Set expiry dates
- Track usage
- Manage campaigns

### 7. Returns & Refunds
- View return requests
- Approve/reject returns
- Process refunds
- CPA compliant workflows

### 8. Reports & Analytics
- Sales reports
- Product performance
- Revenue trends
- Customer insights

### 9. Compliance & Legal
- VAT records
- POPIA controls
- Policy management
- Audit trails

### 10. Security & Logs
- Activity logs
- Security events
- Login attempts
- System monitoring

## 🔗 Connecting to Backend

The admin dashboard communicates with the backend API via fetch API. Ensure:

1. **Backend is deployed and running**
2. **CORS is configured** to allow admin dashboard domain
3. **API endpoints are accessible** from admin dashboard
4. **JWT authentication** is working properly

### API Integration Example

```javascript
// Login
async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('adminToken', data.token);
    }
    return data;
}

// Authenticated API call
async function fetchOrders() {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}
```

## 🧪 Testing Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Open browser**:
   ```
   http://localhost:3000/login.html
   ```

4. **Login with admin credentials** (from backend environment variables)

## 📝 Default Admin Credentials

These are set in your backend `.env` file:
- Email: `admin@premiumhairsa.co.za`
- Password: Set in `ADMIN_PASSWORD` environment variable

**⚠️ IMPORTANT**: Change these immediately after first login in production!

## 🔄 Updates and Maintenance

### Updating the Admin Dashboard
1. Make changes to your code
2. Commit and push to GitHub
3. Render will automatically detect changes and redeploy

### Manual Redeployment
1. Go to your web service in Render Dashboard
2. Click "Manual Deploy" > "Deploy latest commit"

## 📈 Monitoring

- View logs in Render Dashboard
- Monitor API response times
- Track admin activity through backend logs
- Set up alerts for errors

## 🔧 Troubleshooting

### Immediate Redirect/Logout Issue (FIXED)
**Symptom**: When opening the deployed link, the page opens but immediately redirects or kicks you out.

**Root Cause**: URL path mismatch between server routes and JavaScript redirects. The JavaScript was trying to redirect to `/admin/login.html` and `/admin/index.html` which didn't exist in the server routing.

**Solution Implemented**:
1. Updated all redirect URLs in JavaScript files to use `/login` and `/dashboard`
2. Fixed server routing order to serve correct pages at each route
3. Implemented proper authentication flow with localStorage token management

**If you still experience this issue**:
- Clear browser localStorage: Open DevTools → Application → Local Storage → Clear
- Hard refresh the page: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Verify the backend API URL in `js/config.js` is correct
- Check browser console for any JavaScript errors

### Login Issues
- Verify backend is running
- Check API URL is correct in `js/config.js`
- Confirm admin credentials with backend admin
- Check browser console for errors
- Verify backend has proper CORS configuration

### API Connection Issues
- Verify CORS is configured in backend to allow admin dashboard URL
- Check backend URL in `js/config.js` matches your deployed backend
- Ensure backend is accessible (test with curl or Postman)
- Check network tab in browser DevTools for failed requests

### Dashboard Not Loading
- Clear browser cache and localStorage
- Check console for JavaScript errors
- Verify all assets are loading in Network tab
- Check network connectivity
- Ensure you have a valid authentication token

## 📞 Support

For issues or questions:
- Email: support@premiumhairsa.co.za
- Check backend logs for API errors
- Review browser console for frontend errors

## 🔐 Security Notes

### Authentication & Authorization
- This is a **frontend-only** application serving static files
- All authentication and authorization is handled by the **backend API**
- JWT tokens are stored in localStorage and sent with each API request
- The backend API implements:
  - Rate limiting on API endpoints
  - Brute force protection for login attempts
  - Token expiration and validation
  - Secure password hashing (bcrypt)
  - Activity logging and monitoring

### Frontend Security Best Practices
- Never commit sensitive credentials to Git
- Use environment variables for API URLs
- Keep dependencies updated regularly
- Clear tokens from localStorage on logout
- Monitor security logs through the admin dashboard
- Use HTTPS in production (automatically provided by Render)
- Enable strong passwords for admin accounts
- Enable 2FA when available in the backend

### Note on Rate Limiting
The Express server serving this frontend does not implement rate limiting on static file routes, as:
1. This is a static file server, not an API
2. All authentication and rate limiting is handled by the backend API
3. Static assets (CSS, JS, HTML) need to load quickly without restrictions
4. The backend API has proper rate limiting on all authentication and data endpoints
- Use strong passwords
- Enable 2FA when available

## 📄 License

PROPRIETARY - Premium Hair Wigs & Extensions Pty (Ltd)
