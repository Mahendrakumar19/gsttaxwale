# 🚀 **SaaS PLATFORM - DATA PROCESSING & ANALYTICS**

> A production-grade SaaS platform for automated data processing, analytics, and PDF report generation with real-time updates.

## 🎯 **WHAT IS THIS?**

This is **NOT** a simple tax filing website. This is a **scalable SaaS platform** designed for:

✅ **Data Processing** - Automated calculation and analysis  
✅ **Analytics** - Real-time dashboards and charts  
✅ **Report Generation** - Automated PDF creation  
✅ **Real-time Updates** - WebSocket-based notifications  
✅ **Admin Management** - Centralized control panel  
✅ **Multi-user** - Scalable architecture  

---

## 🏗️ **ARCHITECTURE**

```
┌────────────────────────────────────────┐
│    FRONTEND (Next.js + React)          │
│  Dashboard | Reports | Admin | RT      │
└────────────────┬───────────────────────┘
                 │ HTTP + WebSocket
                 ▼
┌────────────────────────────────────────┐
│  BACKEND (Express + Socket.IO)         │
│  Auth | Reports | Dashboard | Admin    │
└─────────────────┬──────────────────────┘
                  │
    ┌─────────────┴──────────────┐
    ▼                            ▼
┌─────────────┐         ┌──────────────┐
│ PostgreSQL  │         │   Redis      │
│ (Database)  │         │ (Cache/Queue)│
└─────────────┘         └──────────────┘
```

---

## 💻 **TECH STACK**

### **Frontend**
```
Next.js 14 | React 18 | TypeScript
Tailwind CSS | Zustand | Socket.IO Client
Axios | Recharts Charting
```

### **Backend**
```
Node.js | Express 4 | Socket.IO 4
JWT Auth | bcryptjs | Redis
PostgreSQL | Prisma ORM
```

### **Services**
```
AWS S3 (Storage)  | Puppeteer (PDF)
Nodemailer (Email) | Redis (Queue)
```

---

## 📁 **PROJECT STRUCTURE**

```
/tax/
├── backend/                    # Express API
│   ├── src/
│   │   ├── app.js             # Main server + Socket.IO
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth
│   │   └── utils/             # Helpers
│   ├── prisma/                # DB schema
│   ├── .env                   # Config
│   └── package.json
│
├── frontend/                   # Next.js App
│   ├── src/
│   │   ├── app/               # Pages
│   │   ├── services/          # API clients
│   │   ├── store/             # Zustand state
│   │   ├── hooks/             # Custom hooks
│   │   └── components/        # React components
│   ├── .env.local
│   └── package.json
│
├── ARCHITECTURE.md            # Full tech docs
├── QUICKSTART.md              # 5-min setup
└── README.md                  # This file
```

---

## ⚡ **QUICK START**

### **Backend**
```bash
cd backend
npm run dev
```
✅ API: `http://localhost:5000`

### **Frontend**
```bash
cd frontend
npm run dev
```
✅ App: `http://localhost:3001`

---

## 🔌 **API ENDPOINTS**

### **Auth**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### **Reports**
```
POST   /api/reports
GET    /api/reports
GET    /api/reports/:id
GET    /api/reports/:id/download
```

### **Admin**
```
GET    /api/dashboard
GET    /api/admin/users
GET    /api/admin/reports
GET    /api/admin/analytics
```

---

## 🔄 **DATA FLOW**

```
User submits form
   ↓
API creates report (pending)
   ↓
Socket.IO emits processing event
   ↓
Backend processes data
   ↓
PDF generated (Puppeteer)
   ↓
Uploaded to S3
   ↓
Real-time notification
   ↓
User downloads PDF
```

---

## 🔐 **AUTHENTICATION**

- JWT tokens
- Password hashing (bcrypt)
- Session management
- Input validation
- Rate limiting (recommended)

---

## 📚 **DOCUMENTATION**

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture
- **[QUICKSTART.md](./QUICKSTART.md)** - Setup guide
- **[API_REFERENCE.md](./API_REFERENCE.md)** - API docs

---

## ✅ **FEATURES**

| Feature | Status |
|---------|--------|
| User Auth | ✅ Done |
| Reports API | ✅ Done |
| Real-time Socket.IO | ✅ Done |
| PDF Generation | 📅 TODO |
| S3 Integration | 📅 TODO |
| Admin Panel | 📅 TODO |
| Analytics Dashboards | 📅 TODO |

---

## 🚀 **NEXT STEPS**

1. Start backend: `npm run dev`
2. Start frontend: `npm run dev`
3. Register a user
4. Test API endpoints
5. Build dashboard components
6. Integrate PDF generation
7. Connect AWS S3
8. Deploy to production

---

For more details, see **[QUICKSTART.md](./QUICKSTART.md)** or **[ARCHITECTURE.md](./ARCHITECTURE.md)**

**Version**: 1.0.0 | **Status**: 🛠️ In Development

### 🎯 Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| **Admin Dashboard** | http://localhost:3001 | Manage services in real-time |
| **API Docs** | http://localhost:5000/api-docs | Interactive API documentation |
| **API Base** | http://localhost:5000/api | Backend API endpoint |

---

## 🎨 Admin Dashboard Features

### Service Management
✅ **Add Services** - Create new tax services with details  
✅ **Edit Services** - Update existing service information  
✅ **Delete Services** - Remove services from database  
✅ **Real-time Sync** - Changes instantly reflect on frontend  
✅ **Search & Filter** - Find services quickly  
✅ **Export** - Export services to Excel  

### Admin Panel
✅ **Authentication** - Secure login with JWT  
✅ **Dashboard** - Overview of all services  
✅ **Forms Validation** - Client & server-side validation  
✅ **Responsive Design** - Works on all devices  
✅ **Dark Mode** - Comfortable for extended use  

---

## 🗂️ Project Structure

```
tax/
├── frontend/                    # Next.js Admin Dashboard
│   ├── src/
│   │   ├── app/(auth)/         # Login/Signup pages
│   │   ├── app/(dashboard)/    # Admin dashboard
│   │   ├── components/         # React components
│   │   ├── lib/               # Utilities & auth
│   │   └── actions/           # Server actions
│   ├── package.json
│   └── .env.local             # Frontend config
│
├── backend/                     # Express REST API
│   ├── config/                # Database settings
│   ├── controllers/           # Business logic
│   ├── models/               # Database models
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth middleware
│   ├── server.js             # Main app
│   ├── package.json
│   └── .env                  # Backend config
│
├── SETUP_GUIDE.md            # Detailed setup guide
└── README.md                 # This file
```

---

## 🔌 API Endpoints

### Core Services API
```
GET    /api/services              # List all services
POST   /api/services              # Create service (Protected)
PUT    /api/services/:id          # Update service (Protected)
DELETE /api/services/:id          # Delete service (Protected)
```

### Authentication
```
POST   /api/auth/register         # Register new user
POST   /api/auth/login            # Login user
GET    /api/auth/profile          # Get profile (Protected)
```

### Other Endpoints
```
POST   /api/contact               # Contact form
POST   /api/career                # Career application
GET    /api/slider                # Get sliders
POST   /api/slider                # Create slider (Protected)
```

**Full API docs at:** http://localhost:5000/api-docs

---

## 🔐 Authentication

The admin panel uses **JWT (JSON Web Tokens)** for secure authentication:

1. User logs in with credentials
2. Backend returns JWT token
3. Token stored in httpOnly cookie
4. Protected routes verify token automatically
5. Token expires in 7 days (configurable)

**Default JWT Secret:** `nighwantech_secret_key_2026`

---

## 🗄️ Database Models

### Users
- Email, Password, Role, Name
- Admin access control

### Services
- Service name, description, price
- Category, status, timestamps

### Sliders
- Image URL, title, description
- Display order

### Contacts
- Name, email, phone, message
- Submission timestamp

### Careers
- Name, email, position, CV details
- Application status

---

## ⚙️ Configuration

### Backend .env
```env
# Database
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=Your_Password_123
DB_NAME=nighwan_tax_db

# Security
JWT_SECRET=nighwantech_secret_key_2026
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
```

### Frontend .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
JWT_SECRET=nighwantech_secret_key_2026
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - Modern React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Recharts** - Charts & graphs
- **Lucide Icons** - UI icons

### Backend
- **Express.js** - Web framework
- **Sequelize** - ORM for databases
- **JWT** - Authentication
- **MSSQL** - Database
- **Multer** - File uploads
- **Joi** - Data validation
- **Swagger** - API documentation
- **Nodemailer** - Email sending

---

## 🚢 Deployment

### Environment Configuration
Change `.env` files for production:

**Backend:**
```env
NODE_ENV=production
DB_HOST=your-server-ip
JWT_SECRET=generate-strong-secret
PORT=5000
```

**Frontend:**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_ENV=production
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
npm start
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port availability
netstat -ano | findstr :5000

# Kill process on port 5000
taskkill /PID <PID> /F
```

### Frontend shows API errors
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is enabled in backend

### Database connection fails
- MSSQL Server must be installed and running
- Verify credentials in `.env`
- Check database name exists

### Authentication not working
- Ensure JWT_SECRET matches in both .env files
- Clear browser cookies
- Check token expiration

---

## 📱 Feature Walkthrough

### Adding a Service (Admin)
1. Go to `http://localhost:3001`
2. Login with admin credentials
3. Navigate to "Services" section
4. Click "Add Service"
5. Fill in service details
6. Click "Save"
7. Service instantly appears in database ✨

### Real-time Updates
- Services page auto-refreshes data
- Charts update in real-time
- No manual page reload needed
- WebSocket ready for future enhancement

---

## 🎓 Learning Resources

- **API Documentation:** http://localhost:5000/api-docs
- **Next.js Docs:** https://nextjs.org/docs
- **Express Guide:** https://expressjs.com/
- **Sequelize ORM:** https://sequelize.org/

---

## 📞 Support & Debugging

### Check Backend Health
```bash
curl http://localhost:5000
# Returns: "Backend is Running! View API Docs at /api-docs"
```

### View API Logs
- Backend logs appear in terminal running `npm run dev`
- Frontend logs appear in browser console

### Monitor Database
```bash
# SSMS/MSSQL Management Studio connection:
Server: localhost
Database: nighwan_tax_db
User: sa
```

---

## ✨ Next Features (Future)

- [ ] Service categories
- [ ] Payment gateway integration
- [ ] User dashboard
- [ ] Email notifications
- [ ] File upload for services
- [ ] Search optimization
- [ ] Multi-language support
- [ ] Mobile app

---

## 📄 License

Part of Nighwan Tech projects. All rights reserved.

---

## 🎉 Ready to Go!

Everything is installed and configured. Just run:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev
```

**Then visit:** http://localhost:3001 🚀

---

**Questions?** Check `SETUP_GUIDE.md` for detailed information.
