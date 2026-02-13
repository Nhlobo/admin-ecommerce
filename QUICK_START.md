# ⚡ Quick Start Guide - Get Running in 5 Minutes

## 🎯 What You Got

✅ **Backend API** - Complete REST API with authentication  
✅ **Customer Frontend** - Modern React e-commerce site  
✅ **Admin Dashboard** - Your existing admin (now working!)  

## 🚀 Start Everything Locally (Right Now!)

### Step 1: Start Backend API (Terminal 1)

```bash
cd backend
npm install
npm start
```

✅ Backend running at: **http://localhost:3000**

### Step 2: Start Admin Dashboard (Terminal 2)

```bash
# From root directory
npm install
npm start
```

✅ Admin running at: **http://localhost:3000** (or 3002)

### Step 3: Start Customer Frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend running at: **http://localhost:3001**

## 🔐 Login to Admin

1. Open: http://localhost:3000/login (or :3002)
2. **Email:** `admin@premiumhairsa.co.za`
3. **Password:** `Admin@123456`

## 🛍️ Browse Store

1. Open: http://localhost:3001
2. Browse products
3. Add to cart
4. Try checkout

## ✅ Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Get products
curl http://localhost:3000/api/products

# Login test
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@premiumhairsa.co.za","password":"Admin@123456"}'
```

## 📁 Next: Deploy to Production

### Copy to Separate Repositories:

**Backend:**
```bash
# Create repo: Nhlobo/backend-ecommerce on GitHub
git clone https://github.com/Nhlobo/backend-ecommerce.git
cp -r backend/* ../backend-ecommerce/
cd ../backend-ecommerce
git add .
git commit -m "Initial backend"
git push origin main
```

**Frontend:**
```bash
# Create repo: Nhlobo/frontend-ecommerce on GitHub
git clone https://github.com/Nhlobo/frontend-ecommerce.git
cp -r frontend/* ../frontend-ecommerce/
cd ../frontend-ecommerce
git add .
git commit -m "Initial frontend"
git push origin main
```

**Admin:** Already in this repo!

### Deploy to Render:

1. **Backend** → Web Service
   - Repo: `Nhlobo/backend-ecommerce`
   - Build: `npm install`
   - Start: `npm start`
   
2. **Frontend** → Static Site
   - Repo: `Nhlobo/frontend-ecommerce`
   - Build: `npm install && npm run build`
   - Publish: `dist`
   
3. **Admin** → Static Site
   - Repo: `Nhlobo/admin-ecommerce` (this one)
   - Build: `npm install && echo "Build complete"`
   - Publish: `.`

Full deployment guide: **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

## 🎉 Done!

Your e-commerce system is:
- ✅ Working locally
- ✅ Admin login fixed
- ✅ Ready to deploy
- ✅ Fully documented

## 📚 More Info

- **[README_COMPLETE_SYSTEM.md](./README_COMPLETE_SYSTEM.md)** - Full system overview
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Detailed deployment
- **[backend/README.md](./backend/README.md)** - API documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend details

## 🐛 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Dependencies issues?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Admin not connecting?**
- Check backend is running on port 3000
- Check browser console for errors
- Verify `js/config.js` has correct API URL

## 💡 Tips

- Backend changes → Restart server
- Frontend changes → Auto-reload
- Admin changes → Refresh browser
- Check terminals for errors
- Use browser DevTools console

---

**Need help?** Check the comprehensive guides:
- README_COMPLETE_SYSTEM.md
- DEPLOYMENT_GUIDE.md
