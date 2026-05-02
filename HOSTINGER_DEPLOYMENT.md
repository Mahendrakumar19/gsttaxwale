# 🚀 Hostinger Deployment Guide (npm run dev)

This guide explains how to deploy the GST Tax Wale platform on Hostinger using `npm run dev` for development mode.

---

## 📋 Prerequisites

- Hostinger Node.js hosting plan
- Node.js 16+ installed on Hostinger
- npm or yarn package manager
- MySQL database access (configured in `.env`)
- All source files uploaded to Hostinger

---

## 🔧 Deployment Steps

### Step 1: Upload All Files to Hostinger

Upload your entire project to Hostinger's Node.js app directory:
```
/home/yourusername/domains/yourdomain.com/nodejs/
```

Include:
- `frontend/` folder
- `backend/` folder
- `prisma/` folder
- `server.js`
- `package.json`
- `.env` (with your production secrets)
- All other necessary files

### Step 2: Verify `.env` Configuration

Make sure your `.env` file is configured for Hostinger:

```env
NODE_ENV=development
PORT=3000

NEXT_PUBLIC_API_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://yourdomain.com

DATABASE_URL="mysql://user:password@host:3306/dbname"
JWT_SECRET=your_secret_key_here
```

### Step 3: Install Dependencies (via Hostinger Terminal or SSH)

```bash
# Navigate to your app directory
cd /home/yourusername/domains/yourdomain.com/nodejs/

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

### Step 5: Start the Application

```bash
npm run dev
```

This starts your unified server on port 3000, serving:
- ✅ Frontend (Next.js) on `https://yourdomain.com`
- ✅ Backend API on `https://yourdomain.com/api`

---

## ✅ Verification

Once started, test the following URLs:

| URL | Expected Result |
|-----|-----------------|
| `https://yourdomain.com/` | Home page loads (200) |
| `https://yourdomain.com/auth/login` | Login page loads (200) |
| `https://yourdomain.com/api/health` | `{"status":"OK","api":"active"}` |
| `https://yourdomain.com/health` | `{"status":"OK","service":"unified-server","environment":"development"}` |

---

## 🛠️ Troubleshooting

### Issue: Static Assets (CSS, JS) Return 404
**Solution**: This is normal in dev mode. Next.js handles asset serving dynamically. Just wait a few seconds for Next.js to compile them.

### Issue: Home Page Returns 404
**Solution**: Make sure `frontend/.next` directory exists or wait for Next.js to generate it.

### Issue: "http.Server.listen() was called more than once"
**Solution**: Ignore this warning. The server is working correctly.

### Issue: Prisma Linux Distro Warning
**Solution**: Ignore this warning. Prisma automatically falls back to compatible engines.

### Issue: Database Connection Failed
**Solution**: Verify your `DATABASE_URL` in `.env` is correct and the database server is accessible from Hostinger.

---

## 🔐 Security Notes

- Always keep `.env` with sensitive data **out of version control**
- Change default `JWT_SECRET` in production
- Update SMTP credentials for email functionality
- Keep Node.js and npm dependencies updated

---

## 📊 Log Monitoring

Hostinger shows logs for your Node.js app. Look for:
- ✅ `Next.js frontend prepared` - Frontend is ready
- ✅ `Backend API routes mounted` - API is ready
- ✅ `GET / → 200` - Home page is working

---

## 💡 Tips for Hostinger

1. **Auto-restart on crash**: Hostinger typically has auto-restart enabled for Node.js apps.
2. **Memory limits**: Monitor memory usage. If your app uses too much RAM, upgrade your plan.
3. **Database performance**: Use connection pooling (already configured in `DATABASE_URL`).
4. **Environment variables**: Use Hostinger's environment variable panel if available.

---

## 🎯 That's It!

Your GST Tax Wale platform should now be running on Hostinger with `npm run dev`. The unified server handles both frontend and backend from a single port.

For production optimization, see `PRODUCTION_DEPLOYMENT.md`.
