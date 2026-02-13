# Premium Hair Wigs & Extensions - Admin Dashboard

This is the secure admin dashboard for managing the Premium Hair Wigs & Extensions e-commerce platform. This is a **standalone repository** that has been migrated from the [monorepo](https://github.com/Nhlobo/ecommerce) for independent deployment.

## 📦 Repository Status

✅ **Migration Complete** - All files have been migrated from the `admin-ecommerce/` directory of the monorepo to this standalone repository.

### Related Repositories
- **Backend API**: [Nhlobo/ecommerce-backend](https://github.com/Nhlobo/ecommerce-backend) (if exists)
- **Customer Frontend**: [Nhlobo/ecommerce-frontend](https://github.com/Nhlobo/ecommerce-frontend) (if exists)
- **Original Monorepo**: [Nhlobo/ecommerce](https://github.com/Nhlobo/ecommerce) (reference only)

## 🏗️ Architecture

The admin dashboard is a standalone web application that:
- Serves as a secure management interface for the e-commerce platform
- Communicates with the backend API (deployed separately)
- Uses JWT authentication for secure access
- Can be deployed independently on platforms like Render, Vercel, or Netlify

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

### Backend API Connection

The admin dashboard needs to connect to the backend API. The API URL is configured in `js/config.js`:

```javascript
const ADMIN_CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'  // Development
        : 'https://backend-ecommerce-3-2jsk.onrender.com',  // Production
    // ... other config
};
```

**To update the backend URL:**
1. Edit `js/config.js`
2. Update the production URL in the `API_BASE_URL` field
3. Replace `https://backend-ecommerce-3-2jsk.onrender.com` with your actual backend deployment URL

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:

- `NODE_ENV` - Set to `production` for production deployment
- `PORT` - Server port (default: 3000)
- `CORS_ORIGINS` - Comma-separated list of allowed origins
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window
- `TRUST_PROXY` - Set to `true` when behind a reverse proxy (like Render)
- `LOG_LEVEL` - Logging level (info, debug, error)

## 🌐 Deployment to Render

### Quick Deployment (Recommended)

This repository is configured for easy deployment to Render using `render.yaml`:

1. **Push code to GitHub** (this repository)
2. **Go to Render Dashboard**: https://dashboard.render.com/
3. **Click "New +"** → **"Blueprint"**
4. **Connect your repository**: `Nhlobo/admin-ecommerce`
5. **Render auto-detects `render.yaml`** and configures everything
6. **Click "Apply"**
7. **Done!** Your admin dashboard will be live

### Backend Connection

**Important:** Make sure your backend API is deployed first and update `js/config.js` with the correct backend URL.

The admin dashboard connects to the backend API at:
- **Development**: `http://localhost:3000`
- **Production**: Update the URL in `js/config.js`

Configuration is automatic via `js/config.js` which detects the environment based on hostname.

### Manual Deployment Steps

If you prefer manual configuration or deploying to a different platform:

#### Step 1: Configure Backend URL

Edit `js/config.js` and update the production API URL:

```javascript
const ADMIN_CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://YOUR-BACKEND-URL.onrender.com',  // ← Update this
    // ...
};
```

#### Step 2: Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +"** and select **"Web Service"**
3. **Connect Your Repository**: Select `Nhlobo/admin-ecommerce`
4. **Configure Web Service**:
   - **Name**: `premium-hair-admin` (or your preferred name)
   - **Region**: Choose the same region as your backend
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Choose appropriate plan (Free tier available)
5. **Add Environment Variables** (optional):
   ```
   NODE_ENV=production
   TRUST_PROXY=true
   ```
6. **Click "Create Web Service"**
7. **Wait for Deployment**

#### Step 3: Update Backend CORS

After deploying the admin, update your backend's CORS configuration to allow requests from the admin URL:

In your backend `.env`:
```
ADMIN_URL=https://your-admin-url.onrender.com
```

Update backend `server.js` CORS configuration:
```javascript
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL
    ],
    credentials: true
}));
```

### Alternative Deployment Platforms

This application can also be deployed to:
- **Vercel**: Static site deployment with serverless functions
- **Netlify**: Static site deployment
- **AWS**: EC2, Elastic Beanstalk, or S3 + CloudFront
- **Heroku**: Web dyno deployment

For these platforms, you may need to:
1. Adjust the `package.json` scripts
2. Add platform-specific configuration files
3. Configure environment variables in the platform's dashboard

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
