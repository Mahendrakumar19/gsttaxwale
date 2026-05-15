# GST Tax Wale - Full Project Structure

This document provides an exhaustive, file-by-file breakdown of the entire GST Tax Wale workspace. Use this as your primary map for navigation and development.

---

## 1. Project Root (Orchestration Layer)
The root directory contains the configuration for the unified server and build processes.

*   `server.js`: The production entry point. It hosts both the Express API and the Next.js frontend in a single process.
*   `package.json`: Manages dependencies and defines scripts for development and production.
*   `.env`: Production environment variables (Database, JWT, Razorpay).
*   `Dockerfile`: Configuration for containerized deployment.
*   `PROJECT_BLUEPRINT.md`: High-level system design.
*   `PROJECT_DOCUMENTATION.md`: Technical setup and workflow guide.

---

## 2. Backend Directory (`/backend`)
The backend is a Node.js/Express application responsible for all business logic and data persistence.

### `/src/controllers` (The Brains)
All 29+ controllers that handle specific business logic:
*   `authController.js`: Handles user/admin login, registration, and OTP verification.
*   `adminController.js`: Comprehensive tools for managing users, services, and site stats.
*   `referralController.js`: Manages user wallets, commissions, and payout requests.
*   `publicReferralController.js`: Generates referral links and codes for non-logged-in users.
*   `orderController.js`: Creates and verifies Razorpay orders.
*   `documentController.js`: Handles secure file uploads and user download access.
*   `serviceController.js`: CRUD operations for the service catalog.
*   `contactController.js`: Manages public inquiries and lead generation.
*   `ticketController.js`: Handles support and redemption tickets.
*   `reportController.js`: Logic for generating and viewing tax reports.

### `/src/services` (The Muscles)
*   `referralService.ts`: Core logic for code generation and commission calculations.
*   `walletService.js`: Ledger-based accounting for points and payouts.
*   `authService.js`: Password hashing and JWT token generation.

### `/src/routes`
*   `api.js`: The central router that maps all `/api/*` endpoints to their respective controllers.

### `/src/utils`
*   `db.js`: A custom MySQL wrapper for raw performance queries.
*   `prisma.js`: Singleton instance for the Prisma ORM.
*   `helpers.js`: Shared utility functions (success/error response formats).

### `/prisma`
*   `schema.prisma`: The master database definition file (Users, Orders, Referrals, etc.).

---

## 3. Frontend Directory (`/frontend`)
A Next.js 14 application using the App Router for a modern, fast user experience.

### `/src/app` (The Skeleton)
*   `page.tsx`: The high-conversion landing page.
*   `/auth`: Login and self-registration pages (Referral-aware).
*   `/dashboard`: The main user portal for tracking filings and documents.
*   `/admin`: A restricted area for managing the entire platform.
    *   `/customers`: User management.
    *   `/services`: Pricing and service control.
*   `/referral`: The user's referral hub (Wallet, Stats, Payout requests).
*   `/checkout`: Secure payment flow integrated with Razorpay.
*   `/services`: Public catalog of all tax compliance services.
*   `/contact`: Public contact form with post-submission referral prompts.

### `/src/components` (The Skin)
*   `SiteHeader.tsx`: Navigation with dynamic Auth/Admin states.
*   `ContactForm.tsx`: Lead capture with integrated WhatsApp referral logic.
*   `ServiceCard.tsx`: Visual cards for service offerings.

### `/src/lib`
*   `fetchClient.ts`: Axios wrapper with automated token injection.
*   `adminAuth.ts`: Route protection logic for admin pages.

---

## 4. Key Deployment Files
*   `HOSTINGER_DEPLOYMENT.md`: Specific instructions for deploying to shared hosting.
*   `DATABASE_MIGRATION_...sql`: SQL snapshots for database structural updates.

---
*Document Version: 2.0 (Full Detailed Map)*
