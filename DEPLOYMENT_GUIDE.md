# Premium Hair E-commerce - Complete Deployment Guide

This document provides complete instructions for deploying the three components of the Premium Hair E-commerce system:

1. **Admin Dashboard** - Admin interface for managing the store
2. **Backend API** - REST API server for all operations
3. **Customer Frontend** - Customer-facing e-commerce website

## 📦 Repository Structure

After following this guide, you will have three separate repositories:

```
Nhlobo/admin-ecommerce      ← Admin Dashboard (already exists)
Nhlobo/backend-ecommerce    ← Backend API (to be created)
Nhlobo/frontend-ecommerce   ← Customer Frontend (to be created)
```

## 🚀 Quick Start - Local Development

### 1. Start Backend API

```bash
cd backend
npm install
npm start
```

Backend runs on: http://localhost:3000

**Default Admin Credentials:**
- Email: admin@premiumhairsa.co.za
- Password: Admin@123456

### 2. Start Admin Dashboard

```bash
# In the root directory
npm install
npm start
```

Admin Dashboard runs on: http://localhost:3002 (or 3000)

Visit: http://localhost:3002/login and use the credentials above.

### 3. Start Customer Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3001

## 📂 Part 1: Preparing Repositories

### Step 1: Create Backend Repository

1. Go to GitHub and create a new repository: `Nhlobo/backend-ecommerce`
2. Clone it locally:
```bash
git clone https://github.com/Nhlobo/backend-ecommerce.git
```

3. Copy all files from the `backend/` directory of admin-ecommerce to the new repository:
```bash
# From the admin-ecommerce directory
cp -r backend/* ../backend-ecommerce/
cd ../backend-ecommerce
```

4. Initialize git and push:
```bash
git add .
git commit -m "Initial backend setup"
git push origin main
```

### Step 2: Create Frontend Repository

1. Go to GitHub and create a new repository: `Nhlobo/frontend-ecommerce`
2. Clone it locally:
```bash
git clone https://github.com/Nhlobo/frontend-ecommerce.git
```

3. Copy all files from the `frontend/` directory:
```bash
# From the admin-ecommerce directory
cp -r frontend/* ../frontend-ecommerce/
cd ../frontend-ecommerce
```

4. Initialize git and push:
```bash
git add .
git commit -m "Initial frontend setup"
git push origin main
```

## 🌐 Part 2: Deploying to Render

### Deploy Backend API

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click "New +" → "Web Service"**
3. **Connect your `Nhlobo/backend-ecommerce` repository**
4. **Configure the service:**
   - **Name:** `premium-hair-backend` (or any name)
   - **Environment:** Node
   - **Region:** Choose your preferred region
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid for production)

5. **Add Environment Variables:** (Click "Advanced" → "Add Environment Variable")

```
NODE_ENV=production
JWT_SECRET=YOUR-SUPER-SECRET-KEY-CHANGE-THIS-NOW-XXXXXXXXXXXX
JWT_EXPIRES_IN=24h
ADMIN_EMAIL=admin@premiumhairsa.co.za
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=Admin User
DATABASE_PATH=/opt/render/project/src/database.sqlite
FRONTEND_URL=https://your-frontend-will-be-here.onrender.com
ADMIN_URL=https://your-admin-will-be-here.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:** Generate a strong JWT_SECRET! You can use:
```bash
openssl rand -base64 32
```

6. **Click "Create Web Service"**

7. **Wait for deployment** (takes 2-5 minutes)

8. **Note your backend URL:** Something like:
   ```
   https://premium-hair-backend-abc123.onrender.com
   ```

### Deploy Admin Dashboard

The admin dashboard is already in the `Nhlobo/admin-ecommerce` repository.

1. **Go to Render Dashboard**
2. **Click "New +" → "Static Site"**
3. **Connect your `Nhlobo/admin-ecommerce` repository**
4. **Configure:**
   - **Name:** `premium-hair-admin`
   - **Branch:** main
   - **Build Command:** `npm install && echo "Build complete"`
   - **Publish Directory:** `.` (current directory)

5. **Click "Create Static Site"**

6. **Note your admin URL:** Something like:
   ```
   https://premium-hair-admin-xyz456.onrender.com
   ```

**Important:** After deployment, you need to update `js/config.js` in the admin repository:

```javascript
const ADMIN_CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://premium-hair-backend-abc123.onrender.com',  // YOUR BACKEND URL
    // ... rest of config
};
```

Commit and push this change, and Render will automatically redeploy.

### Deploy Customer Frontend

1. **Go to Render Dashboard**
2. **Click "New +" → "Static Site"**
3. **Connect your `Nhlobo/frontend-ecommerce` repository**
4. **Configure:**
   - **Name:** `premium-hair-frontend`
   - **Branch:** main
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

5. **Add Environment Variable (optional):**
   ```
   VITE_API_URL=https://premium-hair-backend-abc123.onrender.com
   ```

6. **Click "Create Static Site"**

7. **Note your frontend URL:** Something like:
   ```
   https://premium-hair-frontend-def789.onrender.com
   ```

### Final Step: Update CORS in Backend

After all three are deployed, update the CORS configuration in your backend.

Edit `backend/server.js` and update the CORS origins:

```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://premium-hair-admin-xyz456.onrender.com',    // Your actual admin URL
        'https://premium-hair-frontend-def789.onrender.com'  // Your actual frontend URL
    ],
    credentials: true
}));
```

Commit and push to trigger redeployment.

## ✅ Part 3: Testing Your Deployment

### Test Backend
```bash
curl https://your-backend-url.onrender.com/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "service": "Premium Hair Backend API"
}
```

### Test Admin Login
1. Visit: https://your-admin-url.onrender.com
2. Login with your admin credentials
3. Check that the dashboard loads with data

### Test Frontend
1. Visit: https://your-frontend-url.onrender.com
2. Browse products
3. Add items to cart
4. Try checkout process

## 🔧 Configuration Summary

### Admin Dashboard Points To:
- Development: `http://localhost:3000` (Backend API)
- Production: Your Render backend URL

### Customer Frontend Points To:
- Development: `http://localhost:3000` (Backend API)
- Production: Your Render backend URL

### Backend API Allows:
- Admin dashboard URL
- Customer frontend URL
- Localhost URLs for development

## 📊 Architecture Diagram

```
Customer → Frontend (Render Static Site)
              ↓
           Backend API (Render Web Service)
              ↑
Admin → Admin Dashboard (Render Static Site)
```

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET
- [ ] Update CORS origins in backend
- [ ] Enable HTTPS (Render provides this automatically)
- [ ] Set production environment variables
- [ ] Don't commit .env files

## 🐛 Troubleshooting

### "Failed to fetch" error in admin
- Check that backend is running
- Check CORS configuration in backend
- Verify API_BASE_URL in admin config.js

### CORS errors
- Make sure admin and frontend URLs are in backend CORS config
- Check that backend is actually deployed and running

### Database not initialized
- Check backend logs in Render dashboard
- Verify DATABASE_PATH environment variable

### Login not working
- Verify admin credentials in backend environment variables
- Check backend logs for errors
- Test login endpoint directly:
  ```bash
  curl -X POST https://your-backend/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@premiumhairsa.co.za","password":"YourPassword"}'
  ```

## 📱 Next Steps

After deployment, consider:

1. **Custom Domain:** Add your own domain in Render settings
2. **Database:** Migrate from SQLite to PostgreSQL for production
3. **Email Service:** Add SendGrid/Mailgun for notifications
4. **Payment Gateway:** Integrate Stripe/PayFast
5. **CDN:** Add Cloudflare for better performance
6. **Monitoring:** Set up error tracking with Sentry
7. **Backup:** Implement database backup strategy

## 📞 Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Review this guide carefully
3. Check browser console for errors
4. Verify all environment variables are set correctly

## 📄 Additional Resources

- **Backend README:** See `backend/README.md` for API documentation
- **Frontend README:** See `frontend/README.md` for frontend details
- **Render Docs:** https://render.com/docs
- **Node.js Docs:** https://nodejs.org/docs

---

**Last Updated:** 2024-02-13

**Note:** This is a development setup. For production use, consider:
- Moving to PostgreSQL database
- Adding Redis for caching
- Implementing proper backup strategies
- Setting up CI/CD pipelines
- Adding monitoring and logging
