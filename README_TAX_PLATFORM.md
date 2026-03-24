# 🏛️ Tax Filing Platform - India Income Tax Return Filing System

A **production-ready SaaS platform** for Income Tax Return filing in India, similar to ClearTax/Tax2Win.

## ⭐ Key Features

### 1. **User Authentication**
- ✅ Signup using PAN (Permanent Account Number)
- ✅ Email OTP verification
- ✅ JWT-based authentication
- ✅ Secure password hashing (BCrypt)
- ✅ Profile management

### 2. **Tax Filing System**
- ✅ Multi-step tax return filing form
- ✅ Support for ITR-1, ITR-2, ITR-3, ITR-4
- ✅ Income entry (Salary, Business, Capital Gains, Other)
- ✅ Deduction management (Sections 80C, 80D, 80E, 80G, HRA)
- ✅ Automatic tax calculation
- ✅ Old vs New regime comparison
- ✅ Filing status tracking (Draft → Submitted → Filed → Refunded)

### 3. **Smart Tax Calculation**
- ✅ Indian tax slabs (Old & New Regime)
- ✅ Automatic surcharge calculation
- ✅ Health & Education Cess (4%)
- ✅ Age-based slab selection
- ✅ Regime comparison with tax savings
- ✅ Rebate calculations

### 4. **Document Management**
- ✅ Form-16 upload and storage
- ✅ AWS S3 integration (or MinIO)
- ✅ Document validation
- ✅ Auto-extract metadata from Form-16
- ✅ Multiple document support

### 5. **Payment Integration**
- ✅ Razorpay payment gateway integration
- ✅ Premium filing option
- ✅ Payment verification
- ✅ Receipt generation
- ✅ Payment history tracking

### 6. **CA Assisted Filing**
- ✅ Request CA for assistance
- ✅ CA assignment and tracking
- ✅ Status updates
- ✅ Document sharing with CA
- ✅ Role-based access (User, CA, Admin)

### 7. **Dashboard & Notifications**
- ✅ Filing status overview
- ✅ Refund status tracking
- ✅ Tax payable summary
- ✅ Previous filings list
- ✅ Statistics and analytics
- ✅ Real-time updates via Socket.io

## 🛠️ Tech Stack

### Frontend
```
├── Next.js 14 (App Router)          → SSR/SSG React framework
├── React 18                         → UI library
├── TypeScript                       → Type safety
├── Tailwind CSS                     → Styling
├── ShadCN UI                        → Component library
├── React Hook Form                  → Form handling
├── Zod                              → Schema validation
├── TanStack Query                   → Data fetching & caching
├── Zustand                          → State management
├── Socket.io Client                 → Real-time updates
└── Axios                            → HTTP client
```

### Backend
```
├── Node.js                          → Runtime
├── Express.js 4.18                  → Web framework
├── TypeScript                       → Type safety
├── Prisma ORM                       → Database ORM
├── PostgreSQL                       → Database
├── JWT                              → Authentication
├── BCrypt                           → Password hashing
├── Socket.io                        → Real-time communication
├── Multer                           → File upload
├── Nodemailer                       → Email service
├── AWS SDK / MinIO                  → File storage
├── Razorpay SDK                     → Payment processing
└── Redis (optional)                 → Caching & job queue
```

### Database
```
PostgreSQL 13+
├── Users
├── TaxFilings (ITR data)
├── Income (Multi-source)
├── Deductions (Section-wise)
├── Documents (Form-16, etc.)
├── Payments (Transaction history)
├── CAAssignments
└── OTP (Email verification)
```

## 📁 Project Structure

```
tax/
│
├── 📦 backend/
│   ├── src/
│   │   ├── config/              # App configuration
│   │   ├── controllers/          # API controllers
│   │   ├── services/             # Business logic
│   │   │   ├── authService.ts
│   │   │   ├── taxCalculationService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── dashboardService.ts
│   │   │   └── uploadService.ts
│   │   ├── middleware/           # Express middleware
│   │   │   └── auth.js
│   │   ├── routes/               # API routes
│   │   │   └── api.js
│   │   ├── utils/                # Utilities
│   │   └── app.js               # Express app
│   ├── prisma/
│   │   ├── schema.prisma        # Full DB schema
│   │   └── migrations/
│   ├── .env.example
│   ├── docker Dockerfile
│   ├── package.json
│   └── README.md
│
├── 📱 frontend/
│   ├── src/
│   │   ├── app/                  # Next.js pages
│   │   │   ├── (auth)/           # Auth pages
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── signup/page.tsx
│   │   │   │   └── verify-otp/page.tsx
│   │   │   ├── (dashboard)/      # Protected routes
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── tax/[id]/page.tsx
│   │   │   │   ├── payments/page.tsx
│   │   │   │   └── profile/page.tsx
│   │   │   ├── page.tsx          # Home
│   │   │   └── layout.tsx        # Root layout
│   │   ├── components/           # React components
│   │   │   ├── auth/
│   │   │   ├── tax/
│   │   │   ├── dashboard/
│   │   │   └── shared/
│   │   ├── lib/                  # Libraries
│   │   │   ├── auth-api.ts       # Auth API client
│   │   │   ├── tax-api.ts        # Tax API client
│   │   │   ├── api.ts            # API helpers
│   │   │   └── validations.ts    # Zod schemas
│   │   ├── store/                # Zustand stores
│   │   │   ├── auth.ts
│   │   │   └── taxFiling.ts
│   │   ├── middleware.ts         # Next.js middleware
│   │   └── globals.css
│   ├── public/
│   ├── .env.local               # Frontend config
│   ├── docker Dockerfile
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── 🐳 docker-compose.yml
├── 📚 SETUP_GUIDE_TAX_FILING.md  # Detailed setup guide
└── 📖 README.md                  # This file
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm or yarn
- Docker (optional)

### Step 1: Clone & Install Dependencies

```bash
cd d:\tax

# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### Step 2: Setup Environment Variables

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/tax_filing
JWT_SECRET=your-super-secret-key-min-32-chars
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxx
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_xxxxx
```

### Step 3: Database Setup

```bash
cd backend

# Create database
createdb tax_filing

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### Step 4: Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### Step 5: Test the Application

1. Open http://localhost:3000
2. Signup with:
   - Email: test@example.com
   - Password: TestPass123!
   - PAN: AAAAA0000A (format: 5 letters + 4 digits + 1 letter)
   - Name: Test User

3. Verify email with OTP (check console in dev mode)
4. Create tax filing
5. Enter income and deductions
6. Review tax calculation
7. Submit filing

## 📊 API Endpoints Summary

### Authentication
```
POST   /api/auth/signup              - Register new user
POST   /api/auth/login               - Login
POST   /api/auth/send-otp            - Send OTP to email
POST   /api/auth/verify-otp          - Verify OTP
GET    /api/auth/me                  - Get current user
PUT    /api/auth/profile             - Update profile
POST   /api/auth/logout              - Logout
```

### Tax Filing
```
POST   /api/tax/filing/create        - Create new filing
GET    /api/tax/filing/:id           - Get filing details
GET    /api/tax/filings              - Get user's filings
POST   /api/tax/filing/:id/income    - Update income
POST   /api/tax/filing/:id/deductions - Update deductions
POST   /api/tax/filing/:id/calculate - Calculate tax
POST   /api/tax/filing/:id/submit    - Submit filing
POST   /api/tax/filing/:id/file      - File return
POST   /api/tax/filing/:id/compare-regimes - Compare regimes
```

### Documents
```
POST   /api/upload/document          - Upload document
GET    /api/documents/:filingId      - Get documents
DELETE /api/document/:id             - Delete document
```

### Payments
```
POST   /api/payment/create-order     - Create Razorpay order
POST   /api/payment/verify           - Verify payment
GET    /api/payments                 - Get payment history
```

### CA Assisted Filing
```
POST   /api/ca/request               - Request CA
GET    /api/ca/status/:id            - Get CA status
GET    /api/ca/filings               - Get CA assigned filings
```

### Dashboard
```
GET    /api/dashboard                - Get dashboard data
GET    /api/dashboard/statistics     - Get statistics
GET    /api/dashboard/refund-status  - Get refund status
```

## 💾 Database Schema

### Users Table
- Stores user credentials with PAN as unique identifier
- Roles: user, ca (Chartered Accountant), admin
- Email verification tracking
- Profile information

### TaxFiling Table
- ITR data for each assessment year
- Income, deductions, and tax calculations
- Filing status tracking
- Refund information

### Income Table
- Salary income with breakdown (Basic, DA, TA, etc.)
- Business income
- House property income
- Capital gains
- Other income sources

### Deductions Table
- Section 80C (General savings): PF, LIC, NSC, Tuition fees
- Section 80D (Medical insurance)
- Section 80CCD (Pension)
- Section 80E (Education loan interest)
- Section 80G (Donations)
- Section 24 (HRA)

### Documents Table
- Form-16, Form 26AS files
- Salary slips
- Property documents
- Extracted metadata

### Payments Table
- Payment history with Razorpay integration
- Status tracking (pending, completed, failed, refunded)
- Payment type (premium, filing upgrade)

### OTP Table
- Email OTP for verification
- Expiry tracking
- Verification status

## 🧮 Tax Calculation Logic

### Old Regime (2023-24)
```
Income Range       Tax Rate
₹0 - ₹2,50,000     Nil
₹2,50,001 - ₹5,00,000    5%
₹5,00,001 - ₹10,00,000   20%
₹10,00,001+              30%
```

Deductions:
- Section 80C: Up to ₹1,50,000
- Section 80D: Up to ₹1,00,000 (HoF: ₹1,50,000)
- Section 80E: Education loan interest
- Section 80G: Donations (50-100% eligible)
- Section 24: HRA & Interest on property loan

### New Regime (2023-24)
```
Income Range       Tax Rate
₹0 - ₹3,00,000     Nil
₹3,00,001 - ₹6,00,000    5%
₹6,00,001 - ₹9,00,000    10%
₹9,00,001 - ₹12,00,000   15%
₹12,00,001 - ₹15,00,000  20%
₹15,00,001+              30%
```

Standard Deduction: ₹75,000

### Surcharge & Cess
- Surcharge: Applied on income above ₹50 lakhs (graduated)
- Health & Education Cess: 4% on (Tax + Surcharge)

## 🔐 Security Considerations

### Implemented
- ✅ JWT authentication with expiry
- ✅ Password hashing (BCrypt - 10 rounds)
- ✅ PAN format validation
- ✅ Email OTP verification
- ✅ CORS protection
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection (React sanitization)

### Recommended for Production
- [ ] Rate limiting on API endpoints
- [ ] Refresh token rotation
- [ ] 2FA for sensitive operations
- [ ] API security headers (helmet.js)
- [ ] Request signing
- [ ] DDoS protection
- [ ] WAF (Web Application Firewall)
- [ ] Regular security audits

## 📦 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# This will start:
# - PostgreSQL on port 5432
# - Backend on port 5000
# - Frontend on port 3000
```

## 🧪 Testing Accounts

### User Account
- Email: user@example.com
- Password: TestPass123!
- PAN: AAAAA0000A
- Name: John Doe

### CA Account
- Email: ca@example.com
- Password: CAPass123!
- PAN: CAAAA0001A

### Admin Account
- Email: admin@example.com
- Password: AdminPass123!
- PAN: ADMAA0001A

## 📈 Performance Optimization

- ✅ Database indexing on frequently queried fields
- ✅ Pagination on listing endpoints
- ✅ Query caching with React Query
- ✅ Image optimization (Next.js Image)
- ✅ Code splitting in Frontend
- ✅ Lazy loading of components
- ✅ Redis caching (optional)

## 🚀 Production Deployment

### Recommended Stack
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: AWS EC2, Heroku, Railway, or DigitalOcean
- **Database**: AWS RDS, Managed PostgreSQL
- **Storage**: AWS S3, Google Cloud Storage, or Azure Blob
- **Email**: SendGrid, Mailgun, or AWS SES
- **CDN**: CloudFlare, AWS CloudFront

### Environment Variables for Production
```
NODE_ENV=production
JWT_SECRET=<very-long-random-string>
DATABASE_URL=postgresql://user:password@prod-db:5432/tax_filing
AWS_REGION=ap-south-1
RAZORPAY_KEY_ID=rzp_live_xxxxx (not test)
RAZORPAY_KEY_SECRET=xxxxx
SMTP_HOST=smtp.sendgrid.net
```

## 📚 Documentation

- **Setup Guide**: [SETUP_GUIDE_TAX_FILING.md](./SETUP_GUIDE_TAX_FILING.md)
- **API Documentation**: See routes in `backend/src/routes/api.js`
- **Database Schema**: `backend/prisma/schema.prisma`
- **Tax Rules**: `backend/src/services/taxCalculationService.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper commit messages
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file

## ⚠️ Disclaimer

This is a sample tax filing platform. For real-time tax filing with ITR-V, users should file through the official Income Tax portal: https://www.incometaxindia.gov.in/

## 📞 Support

For issues, questions, or suggestions:
- Create a GitHub issue
- Contact: support@taxplatform.in
- Documentation: https://docs.taxplatform.in

---

**Built with ❤️ for Indian taxpayers**

**Version**: 1.0.0  
**Last Updated**: March 2024
