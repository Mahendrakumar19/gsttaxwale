# ✅ Hostinger Quick Start Checklist

## Pre-Deployment (Local Testing)

- [ ] Run `npm install` in root directory
- [ ] Run `npm install` in `frontend/` directory  
- [ ] Run `npm install` in `backend/` directory
- [ ] Run `npm run dev` locally and verify it works
- [ ] Verify `.env` file has all required variables
- [ ] Test home page loads: `http://localhost:3000/`
- [ ] Test API health: `http://localhost:3000/api/health`
- [ ] Test login page: `http://localhost:3000/auth/login`

## Upload to Hostinger

- [ ] Upload all project files to Hostinger Node.js directory
- [ ] Verify `.env` file is uploaded (keep secrets private)
- [ ] Verify all folders exist: `frontend/`, `backend/`, `prisma/`

## On Hostinger (via SSH or Terminal)

```bash
# Navigate to your app directory
cd /path/to/your/nodejs/app

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Generate Prisma
npx prisma generate

# Start the app
npm run dev
```

## Post-Deployment Testing

- [ ] Home page loads: `https://yourdomain.com/`
- [ ] Login page loads: `https://yourdomain.com/auth/login`
- [ ] API health: `https://yourdomain.com/api/health`
- [ ] Check Hostinger logs for any errors
- [ ] Verify database connection is working

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 404 on Home Page | Wait for Next.js to compile. Check Hostinger logs. |
| Missing CSS/JS | Normal in dev mode. Next.js compiles on first request. |
| Database Connection Error | Verify DATABASE_URL in .env is correct. |
| Static Assets 404 | Next.js dev server handles these automatically. |
| "listen() called more than once" | Ignore - it's a warning, not an error. App still works. |
| Linux distro warning | Ignore - Prisma uses Debian fallback which works fine. |

## Important Files

- **Main Server**: `server.js` - Unified frontend + backend
- **Config**: `.env` - Environment variables (keep secret!)
- **Frontend**: `frontend/src/app/` - Next.js pages
- **Backend API**: `backend/src/routes/api.js` - API endpoints
- **Database**: `backend/prisma/schema.prisma` - Database schema

## Monitoring Logs

Check Hostinger's Node.js app logs for:
```
✅ Next.js frontend prepared
✅ Backend API routes mounted
✅ GET / → 200
```

If you see errors, check the full log message in Hostinger dashboard.

## Keep It Simple

For Hostinger development deployment with `npm run dev`:
- ✅ One unified server (no separate frontend/backend servers)
- ✅ All static assets served automatically
- ✅ Database accessed from single NODE_ENV
- ✅ CORS configured for your domain
- ✅ No production build needed

Just run `npm run dev` and you're done! 🚀
