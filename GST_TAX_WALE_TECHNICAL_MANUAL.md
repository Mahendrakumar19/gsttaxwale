# GST Tax Wale - Unified Technical Manual & System Guide

This document is the **single source of truth** for the GST Tax Wale platform. It combines system architecture, setup instructions, file structures, and operational workflows into one comprehensive manual.

---

## 1. Project Overview & Tech Stack
**GST Tax Wale** is a professional tax compliance platform for GST filing, ITR, and financial services.

### Core Technologies:
*   **Frontend**: Next.js 14+ (App Router), Tailwind CSS (Premium UI), Lucide Icons.
*   **Backend**: Node.js, Express.js (Monolithic Unified Server).
*   **Database**: MySQL with Prisma ORM & Custom Query Wrapper.
*   **Payments**: Razorpay Integrated Payment Gateway.
*   **Security**: JWT-based Authentication with 3-Step OTP verification.

---

## 2. Quick Start: Setting Up a New Project

### Prerequisites
*   Node.js (v18+)
*   MySQL Instance
*   SMTP Credentials (for OTPs)

### Installation Steps
1.  **Clone & Install**:
    ```bash
    git clone <repo_url>
    cd tax
    npm install
    cd backend && npm install
    cd ../frontend && npm install
    ```

2.  **Environment Configuration**:
    Create a `.env` in the root (for production) and `backend/.env` (for dev).
    ```env
    DATABASE_URL="mysql://user:pass@host:3306/db_name"
    JWT_SECRET="your_secure_secret"
    SMTP_HOST="smtp.hostinger.com"
    SMTP_USER="info@gsttaxwale.com"
    SMTP_PASS="your_pass"
    RAZORPAY_KEY_ID="rzp_..."
    RAZORPAY_KEY_SECRET="..."
    ```

3.  **Database Sync**:
    ```bash
    cd backend
    npx prisma db pull  # Sync with existing DB
    npx prisma generate # Generate Client
    ```

4.  **Development Mode**:
    Run `npm run dev` in the root to start the unified development environment.

---

## 3. Full Project Structure (File-by-File Map)

### Root Directory
*   `server.js`: Production entry point (Hosts Express + Next.js).
*   `package.json`: Master dependency and script management.
*   `prisma/schema.prisma`: Master database schema definition.

### Backend (`/backend`)
*   `src/controllers/`: The brains of the application.
    *   `authController.js`: Registration, Login, 3-Step OTP Reset.
    *   `documentController.js`: Multi-document secure uploads.
    *   `sliderController.js`: Homepage dynamic banners.
    *   `serviceController.js`: Service catalog & pricing management.
    *   `locationController.js`: Store/Office search & management.
*   `src/services/`: Core business logic (Referrals, Wallets, Notifications).
*   `src/routes/api.js`: Central API router mapping all `/api/*` endpoints.
*   `src/utils/`: Database wrappers (`db.js`) and response helpers.

### Frontend (`/frontend`)
*   `src/app/`: The routing layer (Next.js App Router).
    *   `/dashboard`: User filing status and downloads.
    *   `/admin`: Full control panel (Customers, Services, Sliders).
    *   `/contact`: Public leads + Post-submit referrals.
    *   `/auth`: Secure login/register flows.
*   `src/components/`: Reusable premium UI components.
    *   `OTPInput.tsx`: Modern 6-box verification component.
    *   `ImageSlider.tsx`: Dynamic homepage banner system.
    *   `ContactForm.tsx`: Lead capture with WhatsApp integration.
*   `src/lib/api.ts`: Centralized Axios client with token handling.

---

## 4. Key Systems & Features

### A. Professional Referral Engine
*   **Format**: `GTW<FIRST_NAME><PHONE_LAST_5>` (e.g., `GTWRAM54321`).
*   **Tracking**: Auto-captured via `?ref=CODE` links and stored during signup.
*   **Rewards**: 10% commission on successful purchases, tracked in a virtual wallet.
*   **UX**: "Copy Code" and "Copy Link" buttons integrated across the dashboard and contact page.

### B. 3-Step Security Flow (OTP)
1.  **Send**: Request OTP via Email or Phone.
2.  **Verify**: Enter 6-digit code via modern `OTPInput` component.
3.  **Action**: Perform sensitive action (Reset Password / Confirm Purchase).

### C. Document Management
*   **Admin Upload**: Support for `upload.array` (multiple files).
*   **Categorization**: Restricted categories (**GST**, **ITR**, **Others**) for clean dashboard organization.
*   **Secure Access**: Documents are served via private routes with session validation.

### D. Homepage CMS
*   **Slider Management**: Admins can upload, toggle, and reorder homepage banners directly from the dashboard.
*   **Dynamic Locations**: Offices are searchable by city/state on the public contact page.

---

## 5. Deployment & Production
1.  **Build**: Run `npm run build` in the frontend.
2.  **Environment**: Ensure all production `.env` variables are set in the Hosting panel.
3.  **Start**: `node server.js` - This handles the entire platform in a single process.

---
*Manual Version: 3.0 | Compiled for GST Tax Wale Team*
