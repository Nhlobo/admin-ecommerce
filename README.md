# Premium Hair Wigs & Extensions - Admin Dashboard

This is the secure admin dashboard for managing the Premium Hair Wigs & Extensions e-commerce platform.

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
├── css/
│   └── admin.css       # Admin dashboard styles
└── js/
    ├── login.js        # Login authentication
    └── admin.js        # Dashboard functionality
```

## 🔧 Configuration

Before deploying, you need to update the API endpoint configuration to point to your backend API.

### Update API Configuration

Create or update the API configuration in the JavaScript files:

**In `js/login.js` and `js/admin.js`**, find the API base URL and update it:

```javascript
const API_BASE_URL = 'https://your-backend-url.onrender.com';
```

## 🌐 Deployment to Render

The admin dashboard is a static site that needs to be served with a simple web server. We'll use a Node.js Express server to serve the static files.

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
}
```

3. **Update API URLs**: Make sure all API calls in `js/login.js` and `js/admin.js` use your deployed backend URL.

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

### Step 4: Update Backend CORS

After deploying the admin, update your backend's CORS configuration to allow requests from the admin URL:

In your backend `.env`:
```
ADMIN_URL=https://premium-hair-admin.onrender.com
```

Update backend `server.js` CORS configuration:
```javascript
app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
        'https://premium-hair-admin.onrender.com'
    ],
    credentials: true
}));
```

## 🔐 Security Best Practices

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

### Login Issues
- Verify backend is running
- Check API URL is correct
- Confirm admin credentials
- Check browser console for errors

### API Connection Issues
- Verify CORS is configured in backend
- Check backend URL in admin config
- Ensure backend is accessible
- Check network tab in browser DevTools

### Dashboard Not Loading
- Clear browser cache
- Check console for errors
- Verify all assets are loading
- Check network connectivity

## 📞 Support

For issues or questions:
- Email: support@premiumhairsa.co.za
- Check backend logs for API errors
- Review browser console for frontend errors

## 🔐 Security Notes

- Never commit sensitive credentials to Git
- Use environment variables for API URLs
- Keep dependencies updated
- Monitor security logs regularly
- Use strong passwords
- Enable 2FA when available

## 📄 License

PROPRIETARY - Premium Hair Wigs & Extensions Pty (Ltd)
