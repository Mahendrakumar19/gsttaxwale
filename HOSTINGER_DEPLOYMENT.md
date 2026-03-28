# Hostinger Deployment Checklist

## ✅ Step 1: Frontend Build
**Status:** ✅ COMPLETE
- Frontend built successfully with `npm run build`
- Production assets ready in `.next/` folder
- All 28 routes compiled successfully

## ✅ Step 2: Backend Server Configuration
**Status:** ✅ COMPLETE
Files created/updated:
- `backend/server.js` - Main entry point
- `backend/package.json` - Updated "start" script
- `.htaccess` - Routing configuration

## 📋 Step 3: Hostinger Node.js Configuration (Manual)

### In Hostinger Dashboard:
1. Go to **Advanced → Node.js**
2. Click **Create Application**
3. Set:
   - **Application root:** `public_html/backend`
   - **Startup file:** `server.js`
   - **Node version:** `18` or higher
   - **Port:** `5000` (default)

## 🚀 Step 4: Deploy to Hostinger

### Upload these folders to `public_html/`:
```
public_html/
 ├── backend/
 ├── frontend/
 └── .htaccess
```

### Files to upload from backend/:
- `server.js` ✅ (created)
- `package.json` ✅ (updated)
- `package-lock.json`
- `src/` (all existing files)
- `prisma/` (all existing files)
- `.env.local` (configure with production values)

### Files to upload from frontend/:
- `.next/` (entire compiled folder)
- `public/` (static files)
- `package.json`
- `package-lock.json`

## 🔧 Environment Variables

Create `.env.local` in `backend/` with:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_production_database_url
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=https://gsttaxwale.com/api
```

## 📱 Frontend Configuration

Update `frontend/.env` with:
```
NEXT_PUBLIC_API_URL=https://gsttaxwale.com/api
```

## ✅ After Deployment

1. In Hostinger Node.js panel → Run command: `npm install`
2. Click **Restart Application**
3. Test at: `https://gsttaxwale.com`

### Health Check:
```bash
curl https://gsttaxwale.com/health
```

If JSON response: ✅ Backend is running
If JSON response failure: ❌ Check logs in Hostinger dashboard

## 🐛 Troubleshooting

### Backend won't start:
- Check `/backend/.env.local` exists
- Verify `database_url` is correct
- Check Hostinger logs for errors

### Frontend not loading:
- Verify `.next/` folder exists
- Check browser console for 404 errors
- Verify `NEXT_PUBLIC_API_URL` in frontend/.env

### API calls failing:
- Check CORS settings in `backend/server.js`
- Verify backend server is running
- Test `/api/health` endpoint

## 🎉 Deployment Complete!
Your site will be live at: https://gsttaxwale.com
