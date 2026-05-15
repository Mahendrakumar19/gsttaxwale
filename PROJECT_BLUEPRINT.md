# GST Tax Wale - Master Project Blueprint

This document provides a complete, top-down structure of the entire GST Tax Wale ecosystem. It is designed to be the ultimate reference for understanding, setting up, and scaling the application from scratch.

---

## 1. System Philosophy
**GST Tax Wale** is built as a **Semi-Monolithic SaaS**. 
*   **Frontend**: A high-performance Next.js application handling SEO (Landing Pages) and secure state (User/Admin Dashboards).
*   **Backend**: A robust Express.js API that acts as a secure bridge between the frontend and the MySQL database.
*   **Security**: JWT-based stateless authentication with dual-layer validation (Admin vs. User).

---

## 2. Infrastructure Map

### A. Environment Configuration
Every environment requires two primary configuration files:

#### Backend `.env`
*   `PORT`: Server port (typically 5000).
*   `DATABASE_URL`: Connection string for MySQL.
*   `JWT_SECRET`: Secret key for token encryption.
*   `RAZORPAY_KEY_ID` / `SECRET`: For payment processing.
*   `SMTP_` Config: For automated emails (Nodemailer).

#### Frontend `.env.local`
*   `NEXT_PUBLIC_API_URL`: Path to the backend (e.g., `https://api.gsttaxwale.com`).

---

## 3. Project Directory Structure

```text
tax/
├── backend/                        # API & Core Business Logic
│   ├── prisma/                     # Database source of truth
│   │   └── schema.prisma           # SQL Table definitions
│   ├── src/
│   │   ├── controllers/            # Request Logic (The "Brain")
│   │   │   ├── authController.js   # Login, Register, OTP
│   │   │   ├── adminController.js  # Management of Users & Services
│   │   │   └── referralController.js # Wallet & Commission logic
│   │   ├── services/               # Reusable logic (The "Muscles")
│   │   │   ├── referralService.ts  # Code generation & attribution
│   │   │   └── walletService.js    # Ledger-based accounting
│   │   ├── routes/                 # API Endpoint Definitions
│   │   └── utils/                  # DB connection & Helpers
│   └── server.js                   # Unified production entry point
│
├── frontend/                       # Client-side Interface
│   ├── public/                     # Images, SVGs, and Static files
│   ├── src/
│   │   ├── app/                    # Next.js App Router (The "Skeleton")
│   │   │   ├── (public)/           # Landing, Services, About
│   │   │   ├── auth/               # Login & Register (Ref-aware)
│   │   │   ├── dashboard/          # Client control panel
│   │   │   ├── admin/              # Management control panel
│   │   │   └── referral/           # Referral & Wallet interface
│   │   ├── components/             # UI Building Blocks (The "Skin")
│   │   ├── lib/                    # Shared hooks & API fetchers
│   │   └── styles/                 # Tailwind & Global CSS
│   └── package.json                # Frontend dependencies
```

---

## 4. Logical Module Breakdown

### Module 1: The Referral Engine
*   **Generation**: Uses a deterministic logic (`GTW` + Name + Phone) to create brand-focused codes.
*   **Attribution**: Captured via browser URL params, persisted through signup, and linked in the `Referral` table.
*   **Payout**: A ledger-based wallet tracks credits. Debit requests generate Admin Tickets to ensure human verification before funds leave the system.

### Module 2: The Order & Payment Pipeline
*   **Flow**: User Selects Service -> Enters Details -> Razorpay Modal -> Verification -> Database Update.
*   **Automation**: On successful payment, the system automatically checks for a referring user and calculates commission in the background.

### Module 3: Document Management
*   **Security**: Documents are stored with unique, non-guessable paths.
*   **Association**: Every document is linked to a `userId` and a `category` (ITR, GST, PAN), making it easy for users to find records by Financial Year.

### Module 4: Administrative Control
*   **Customer 360**: Admin can view, edit, delete users, and reset passwords.
*   **Service Catalog**: Dynamic control over pricing, descriptions, and "Sale" status.

---

## 5. Data Flow Diagram (The Lifecycle)

1.  **Discovery**: Guest visits landing page (possibly with a `?ref=` link).
2.  **Acquisition**: User registers; the system detects the referral and hashes the password.
3.  **Engagement**: User submits an inquiry (Contact Form) or purchases a service (Order).
4.  **Fulfillment**: Admin receives the order, processes the tax filing, and uploads the PDF.
5.  **Retention**: User sees their filed document in the dashboard and invites friends to earn rewards.

---

## 6. How to Clone/Duplicate this Project
1.  **Setup DB**: Create a MySQL DB and run `npx prisma db push` from the backend.
2.  **Backend Init**: `npm install`, set `.env`, and `npm run dev`.
3.  **Frontend Init**: `npm install`, set `NEXT_PUBLIC_API_URL`, and `npm run dev`.
4.  **Seed Data**: Use the admin panel to create the first set of services.

---
*Created by Antigravity AI for GST Tax Wale Development Framework.*
