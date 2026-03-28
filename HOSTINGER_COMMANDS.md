# Hostinger Deployment - Quick Start Commands

## Before Uploading to Hostinger

Run these commands locally to verify everything works:

```bash
# Build frontend
cd frontend
npm run build

# Verify build
ls -la .next/

# Go back to root
cd ..

# Install backend dependencies
cd backend
npm install

# List what will be uploaded
echo "Files to upload:"
echo "backend/server.js"
echo "backend/package.json"
echo "backend/package-lock.json"
echo "backend/src/"
echo "backend/prisma/"
echo "backend/.env.local (with production values)"
echo "frontend/.next/"
echo "frontend/public/"
echo ".htaccess"
```

## Step-by-Step Hostinger Deployment

### 1. Upload Files via FTP/File Manager
```
Upload to public_html/:
- backend/ (entire folder)
- frontend/.next/ (built folder only)
- frontend/public/ (static files)
- .htaccess (routing config)
```

### 2. Configure Node.js in Hostinger Dashboard
```
Path: Hostinger → Advanced → Node.js

Create Application:
- Application root: public_html/backend
- Startup file: server.js
- Node version: 18 or higher
- Click: Create Application
```

### 3. Install Dependencies
```
In Node.js panel:
- Click "Terminal"
- Run: npm install
- Wait for completion
```

### 4. Configure Environment
```
In Node.js panel:
- Click "Environment Variables"
- Add from backend/.env.production.example
- Key values needed:
  * DATABASE_URL (your database connection)
  * JWT_SECRET (generate a strong random string)
```

### 5. Restart Application
```
In Node.js panel:
- Click "Restart Application"
- Wait 30-60 seconds
```

### 6. Test Deployment
```bash
# Test backend is running
curl https://gsttaxwale.com/health

# Test API endpoints
curl https://gsttaxwale.com/api/auth/me

# Test frontend loads
curl https://gsttaxwale.com/
```

## Environment Variables Required

```env
# Production Database
DATABASE_URL=postgresql://username:password@host:5432/db_name

# Security
JWT_SECRET=generate_a_strong_random_string_here
NODE_ENV=production

# Frontend API URL (in frontend/.env)
NEXT_PUBLIC_API_URL=https://gsttaxwale.com/api
```

## Troubleshooting Commands

```bash
# Check if Node.js app is running
ps aux | grep node

# Check port 5000 is listening
netstat -an | grep 5000

# View application logs
tail -f /path-to-app/logs/app.log

# Restart application
npm restart

# Manual start
node server.js
```

## Files Checklist

Before deployment, verify:

✅ frontend/.next/ folder exists (not empty)
✅ backend/server.js exists
✅ backend/package.json has "start": "node server.js"
✅ backend/.env.local configured with production values
✅ .htaccess in public_html/
✅ Prisma schema configured (backend/prisma/schema.prisma)
✅ No node_modules/ folder (will be installed on server)

## Production Optimization

### For Better Performance:
1. Enable Redis for caching
2. Set up CDN for frontend static files
3. Use PostgreSQL instead of SQLite
4. Enable database connection pooling
5. Set up monitoring/alerting

### Security Checklist:
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] DATABASE_URL uses SSL/TLS
- [ ] CORS is configured properly
- [ ] All environment variables are in .env.local (not in code)
- [ ] .env files are in .gitignore
- [ ] npm audit shows no high vulnerabilities

## Support & Debugging

Monitor via Hostinger Dashboard:
1. Node.js → Application → Log
2. View real-time logs for errors
3. Check resource usage (CPU, Memory, Bandwidth)

Common issues & fixes are in: HOSTINGER_DEPLOYMENT.md
