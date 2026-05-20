# GST Tax Wale - Technical Documentation

## 1. Project Overview
**GST Tax Wale** is a premium tax compliance and financial services platform designed for businesses and individuals in India. It simplifies GST filing, Income Tax Returns (ITR), and various compliance tasks through an automated dashboard, document management system, and an integrated referral program.

### Tech Stack
*   **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Lucide React.
*   **Backend**: Node.js, Express.js.
*   **Database**: MySQL (hosted on Hostinger/Local).
*   **ORM**: Prisma (for complex relations) & Custom MySQL Wrapper (for performance).
*   **Payments**: Razorpay Integration.
*   **Authentication**: JWT-based with OTP (Nodemailer) and Password support.

---

## 2. Project Setup & Installation

### Prerequisites
*   Node.js (v18 or higher)
*   MySQL Server
*   NPM or Yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd tax
```

### Step 2: Backend Setup
1.  Navigate to the backend folder: `cd backend`
2.  Install dependencies: `npm install`
3.  Configure Environment Variables: Create a `.env` file.
    ```env
    PORT=5000
    DATABASE_URL="mysql://user:password@localhost:3306/tax_db"
    JWT_SECRET="your_secret_key"
    FRONTEND_URL="http://localhost:3000"
    
    # Razorpay
    RAZORPAY_KEY_ID="rzp_test_..."
    RAZORPAY_KEY_SECRET="..."
    
    # Email (Nodemailer)
    SMTP_HOST="smtp.hostinger.com"
    SMTP_USER="info@gsttaxwale.com"
    SMTP_PASS="..."
    ```
4.  Run Database Migrations: `npx prisma generate`
5.  Start Backend: `npm run dev`

### Step 3: Frontend Setup
1.  Navigate to the frontend folder: `cd frontend`
2.  Install dependencies: `npm install`
3.  Configure Environment Variables: Create a `.env.local` file.
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:5000"
    ```
4.  Start Frontend: `npm run dev`

---

## 3. Core Architecture

### Frontend (Next.js)
*   **App Router**: Uses the `/app` directory for routing.
*   **Components**: Modular UI components located in `/src/components`.
*   **State Management**: React `useState` and `useEffect` combined with `localStorage` for session persistence.
*   **API Layer**: Uses a shared `fetchClient` or `axios` for communicating with the backend.

### Backend (Express)
*   **Controllers**: Logic for handling API requests (`/src/controllers`).
*   **Services**: Business logic and database operations (`/src/services`).
*   **Routes**: API endpoint definitions (`/src/routes/api.js`).
*   **Middleware**: Authentication and error handling (`/src/middleware`).

---

## 4. Key Systems & Workflows

### A. Authentication Flow
1.  **Self-Registration**: Users can sign up via `/auth/register`.
2.  **Admin Creation**: Admins can manually create users via the Admin Panel.
3.  **OTP Verification**: Used for secure actions like password resets or service purchases.
4.  **JWT Tokens**: Stored in `localStorage` to keep users logged in.

### B. Referral System (Professional Grade)
*   **Code Format**: Memorable codes in the format `GTW<NAME><PHONE_LAST_5>`.
*   **Tracking**: Captured via `?ref=CODE` in the URL and stored during registration.
*   **Wallet**: Each user has a virtual wallet.
*   **Commission**: Automatically triggered (10% or flat ₹200) when a referred user completes a payment.
*   **Withdrawal**: Users submit payout requests (UPI/Bank) which generate admin tickets for processing.

### C. Service & Order Flow
1.  **Catalog**: Admin manages services and pricing.
2.  **Checkout**: Users purchase services via Razorpay.
3.  **Tickets**: Every order can generate a support ticket for document collection and status tracking.
4.  **Filing Status**: Admins update the status (Pending -> Processing -> Filed) which reflects in the user's dashboard.

### D. Document Management
*   **Uploads**: Admins upload finalized PDFs (GSTR-3B, ITR-V) for specific users.
*   **Downloads**: Users access their documents via the "Downloads" tab in the dashboard.
*   **Organization**: Documents are grouped by Financial Year and Category.

---

## 5. Folder Structure
```text
tax/
├── backend/
│   ├── prisma/             # Database Schema
│   ├── src/
│   │   ├── controllers/    # Request Handlers
│   │   ├── services/       # Business Logic
│   │   ├── routes/         # API Endpoints
│   │   └── utils/          # DB Helpers & Helpers
│   └── server.js           # Entry Point
├── frontend/
│   ├── src/
│   │   ├── app/            # Pages (Next.js)
│   │   ├── components/     # UI Components
│   │   ├── lib/            # API Clients & Utils
│   │   └── styles/         # Global CSS
│   └── package.json
```

---

## 6. Deployment Notes
*   **Hosting**: Unified server approach where Express handles both API and Next.js static assets in production.
*   **SSL**: Ensure `JWT_SECRET` and `DATABASE_URL` are set as environment variables in the production environment (e.g., Hostinger Panel).
*   **Build**: Run `npm run build` in the frontend before deploying to generate the production bundle.

---

## 7. Key Modules Worked On (Since Inception)

Since starting the project, we have systematically engineered, optimized, and stabilized several mission-critical modules across the frontend and backend:

### 🚀 Module 1: Unified Server & High-Performance Architecture
*   **Accomplishments**: Successfully consolidated the Next.js frontend and Express backend into a seamless, single-port monolithic deployment managed by `server.js` on Hostinger.
*   **Features**:
    *   Dynamic environment detection (development vs. production).
    *   Pre-flight build integrity checks to prevent silent Next.js launch crash loops when `.next` assets are missing.
    *   Granular cross-platform package scripts for streamlined builds and executions.

### 🔑 Module 2: Secure JWT Authentication & User Credentials System
*   **Accomplishments**: Implemented comprehensive JWT stateless authorization guards for the user dashboard and administrative portal.
*   **Features**:
    *   Password reset utility directly inside the Profile tab with clean, dual-password input validations (old vs. new credentials validation).
    *   Automated email alerts dispatched upon password resets or profile modifications.

### 👥 Module 3: Double-Sided Automated Referral & Wallet Engine
*   **Accomplishments**: Built a professional-grade marketing referral and points system with optimized database tracking.
*   **Features**:
    *   Deterministic code formatter (`gtw<NAME><PHONE_LAST_4>`) generated on user registration.
    *   Robust public referral capture and backend attribution using transaction-safe MySQL queries (completely removing legacy crashes related to `active` or `refereeName` schema mismatches).
    *   Dual SMTP email dispatches:
        1.  *To Referrer*: Confirmation with their unique code.
        2.  *To Referee (Friend)*: A welcoming invitation personalized with the referrer's name and code.

### 💳 Module 4: Order & Razorpay Payment Pipeline
*   **Accomplishments**: Integrated Razorpay's premium checkout modal for Indian standard cards, Net Banking, UPI, and Digital Wallets.
*   **Features**:
    *   Smart authentication routing that checks login status before loading details page items.
    *   HMAC-SHA256 signature verification in the backend, coupled with a secondary direct API look-up to secure every transaction against tampering.
    *   Auto-crediting of referral commission directly to referrer wallets upon paid orders.

### 📂 Module 5: Secure Document Management System
*   **Accomplishments**: Enabled clean administrative tax document dispatching and secure downloading.
*   **Features**:
    *   Admin-facing interface to upload and bind official tax documents (e.g., GSTR-3B filings, ITR-V forms) directly to specific users.
    *   Secure user portal enabling filtered historical search and downloads organized by category and financial year.

### 🛠️ Module 6: Advanced Administrative Controls
*   **Accomplishments**: Restored complete admin CRUD tools for client portfolio management.
*   **Features**:
    *   Interactive **Edit Customer Modal** allowing full update access to legal details, addresses (Door, Building, Street, Area, City, State, Pincode), PAN, Aadhaar, status, and referral codes.
    *   Comprehensive **Create Customer Page** collecting full personal and identity credentials, complete with copy-to-clipboard credential fields.

---
*Generated by Antigravity AI for GST Tax Wale Developer Team.*

