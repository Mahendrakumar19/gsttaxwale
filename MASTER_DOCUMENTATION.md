# GST Tax Wale - Master Documentation

This is the all-encompassing documentation for the GST Tax Wale project. It contains the Technical Documentation, the Master Blueprint, and the Full Project Structure.

---

## Part 1: Technical Documentation (Setup & Workflows)

### 1. Project Overview
**GST Tax Wale** is a premium tax compliance and financial services platform designed for businesses and individuals in India. It simplifies GST filing, Income Tax Returns (ITR), and various compliance tasks through an automated dashboard, document management system, and an integrated referral program.

### Tech Stack
*   **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Lucide React.
*   **Backend**: Node.js, Express.js.
*   **Database**: MySQL (hosted on Hostinger/Local).
*   **ORM**: Prisma (for complex relations) & Custom MySQL Wrapper (for performance).
*   **Payments**: Razorpay Integration.
*   **Authentication**: JWT-based with OTP (Nodemailer) and Password support.

---

### 2. Project Setup & Installation

#### Prerequisites
*   Node.js (v18 or higher)
*   MySQL Server
*   NPM or Yarn

#### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd tax
```

#### Step 2: Backend Setup
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

#### Step 3: Frontend Setup
1.  Navigate to the frontend folder: `cd frontend`
2.  Install dependencies: `npm install`
3.  Configure Environment Variables: Create a `.env.local` file.
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:5000"
    ```
4.  Start Frontend: `npm run dev`

---

### 3. Core Architecture

#### Frontend (Next.js)
*   **App Router**: Uses the `/app` directory for routing.
*   **Components**: Modular UI components located in `/src/components`.
*   **State Management**: React `useState` and `useEffect` combined with `localStorage` for session persistence.
*   **API Layer**: Uses a shared `fetchClient` or `axios` for communicating with the backend.

#### Backend (Express)
*   **Controllers**: Logic for handling API requests (`/src/controllers`).
*   **Services**: Business logic and database operations (`/src/services`).
*   **Routes**: API endpoint definitions (`/src/routes/api.js`).
*   **Middleware**: Authentication and error handling (`/src/middleware`).

---

### 4. Key Systems & Workflows

#### A. Authentication Flow
1.  **Self-Registration**: Users can sign up via `/auth/register`.
2.  **Admin Creation**: Admins can manually create users via the Admin Panel.
3.  **OTP Verification**: Used for secure actions like password resets or service purchases.
4.  **JWT Tokens**: Stored in `localStorage` to keep users logged in.

#### B. Referral System (Professional Grade)
*   **Code Format**: Memorable codes in the format `GTW<NAME><PHONE_LAST_5>`.
*   **Tracking**: Captured via `?ref=CODE` in the URL and stored during registration.
*   **Wallet**: Each user has a virtual wallet.
*   **Commission**: Automatically triggered (10% or flat ₹200) when a referred user completes a payment.
*   **Withdrawal**: Users submit payout requests (UPI/Bank) which generate admin tickets for processing.

#### C. Service & Order Flow
1.  **Catalog**: Admin manages services and pricing.
2.  **Checkout**: Users purchase services via Razorpay.
3.  **Tickets**: Every order can generate a support ticket for document collection and status tracking.
4.  **Filing Status**: Admins update the status (Pending -> Processing -> Filed) which reflects in the user's dashboard.

#### D. Document Management
*   **Uploads**: Admins upload finalized PDFs (GSTR-3B, ITR-V) for specific users.
*   **Downloads**: Users access their documents via the "Downloads" tab in the dashboard.
*   **Organization**: Documents are grouped by Financial Year and Category.

---

### 5. Deployment Notes
*   **Hosting**: Unified server approach where Express handles both API and Next.js static assets in production.
*   **SSL**: Ensure `JWT_SECRET` and `DATABASE_URL` are set as environment variables in the production environment (e.g., Hostinger Panel).
*   **Build**: Run `npm run build` in the frontend before deploying to generate the production bundle.

---

## Part 2: Master Project Blueprint (Logic & Design)

### 1. System Philosophy
**GST Tax Wale** is built as a **Semi-Monolithic SaaS**. 
*   **Frontend**: A high-performance Next.js application handling SEO (Landing Pages) and secure state (User/Admin Dashboards).
*   **Backend**: A robust Express.js API that acts as a secure bridge between the frontend and the MySQL database.
*   **Security**: JWT-based stateless authentication with dual-layer validation (Admin vs. User).

---

### 2. Logical Module Breakdown

#### Module 1: The Referral Engine
*   **Generation**: Uses a deterministic logic (`GTW` + Name + Phone) to create brand-focused codes.
*   **Attribution**: Captured via browser URL params, persisted through signup, and linked in the `Referral` table.
*   **Payout**: A ledger-based wallet tracks credits. Debit requests generate Admin Tickets to ensure human verification before funds leave the system.

#### Module 2: The Order & Payment Pipeline
*   **Flow**: User Selects Service -> Enters Details -> Razorpay Modal -> Verification -> Database Update.
*   **Automation**: On successful payment, the system automatically checks for a referring user and calculates commission in the background.

#### Module 3: Document Management
*   **Security**: Documents are stored with unique, non-guessable paths.
*   **Association**: Every document is linked to a `userId` and a `category` (ITR, GST, PAN), making it easy for users to find records by Financial Year.

---

## Part 3: Full Project Structure (File Map)

### 1. Project Root
*   `server.js`: The production entry point.
*   `package.json`: Dependency management.
*   `.env`: Production environment variables.
*   `prisma/schema.prisma`: Master database schema.

### 2. Backend Directory (`/backend/src`)
*   **Controllers**: Logic handlers for Auth, Admin, Referrals, etc.
*   **Services**: Core logic for Referrals and Wallets.
*   **Routes**: Centralized API mapping in `api.js`.
*   **Utils**: DB connection (`db.js`) and shared helpers.

### 3. Frontend Directory (`/frontend/src`)
*   **App Router**: Secure areas for `/admin`, `/dashboard`, and `/referral`.
*   **Components**: Reusable UI blocks like `ContactForm` and `SiteHeader`.
*   **Lib**: API clients and Auth helpers.

---
*End of Master Documentation - Version 1.0*
