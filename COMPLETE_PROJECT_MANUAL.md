# GST Tax Wale: The Complete Technical Manual

This is the definitive, all-in-one documentation for the GST Tax Wale project. It merges the setup guides, architectural blueprints, and full file structures into a single source of truth.

---

## Table of Contents
1.  [Project Overview](#1-project-overview)
2.  [Setup & Installation Guide](#2-setup--installation-guide)
3.  [Architectural Blueprint](#3-architectural-blueprint)
4.  [Logical Module Breakdown](#4-logical-module-breakdown)
5.  [Detailed Project Structure (File Map)](#5-detailed-project-structure-file-map)
6.  [Core Workflows & Lifecycles](#6-core-workflows--lifecycles)
7.  [Deployment & Maintenance](#7-deployment--maintenance)

---

## 1. Project Overview
**GST Tax Wale** is a premium tax compliance and financial services platform designed for businesses and individuals in India. It simplifies GST filing, Income Tax Returns (ITR), and various compliance tasks through an automated dashboard, document management system, and an integrated referral program.

### Tech Stack
*   **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Lucide React.
*   **Backend**: Node.js, Express.js.
*   **Database**: MySQL (Prisma + Custom Wrapper).
*   **Payments**: Razorpay.
*   **Auth**: JWT with OTP and Password support.

---

## 2. Setup & Installation Guide

### Prerequisites
*   Node.js (v18+)
*   MySQL Server

### Quick Start
1.  **Backend Setup**:
    *   `cd backend && npm install`
    *   Create `.env` with `DATABASE_URL`, `JWT_SECRET`, and `RAZORPAY_` keys.
    *   `npx prisma generate`
    *   `npm run dev`
2.  **Frontend Setup**:
    *   `cd frontend && npm install`
    *   Create `.env.local` with `NEXT_PUBLIC_API_URL`.
    *   `npm run dev`

---

## 3. Architectural Blueprint

### System Philosophy
The platform is a **Semi-Monolithic SaaS**. It uses a unified `server.js` in the root to host both the API and the Frontend in production, ensuring easy deployment on shared hosting like Hostinger.

### Data Layer
We use a hybrid approach:
*   **Prisma**: For complex relational management and migrations.
*   **Custom DB Wrapper (`db.js`)**: For high-performance raw SQL queries in critical paths.

---

## 4. Logical Module Breakdown

### The Referral Engine
*   **Codes**: Deterministic format `GTW<NAME><PHONE_LAST_5>`.
*   **Tracking**: Persistent tracking from URL params to registration.
*   **Payouts**: Ledger-based wallet with Admin Ticket verification.

### Order & Payment Pipeline
*   Integrated with **Razorpay**.
*   Automated commission calculation upon payment verification.

---

## 5. Detailed Project Structure (File Map)

### Root
*   `server.js`: Unified entry point.
*   `prisma/schema.prisma`: Master database schema.

### Backend (`/backend/src`)
*   **Controllers**: 29+ handlers for Auth, Admin, Referrals, Orders, Documents, etc.
*   **Services**: Core logic for Referrals, Wallets, and Authentication.
*   **Routes**: Centralized API mapping in `api.js`.

### Frontend (`/frontend/src`)
*   **App Router**: Secure areas for `/admin`, `/dashboard`, and `/referral`.
*   **Components**: Premium UI blocks like `ContactForm` with WhatsApp referral logic.

---

## 6. Core Workflows & Lifecycles

### The User Journey
1.  **Entry**: Guest arrives (via referral or direct).
2.  **Conversion**: Guest signs up or submits an inquiry (Lead).
3.  **Purchase**: User buys a service via Razorpay.
4.  **Reward**: Referrer is automatically credited.
5.  **Fulfillment**: Admin uploads documents; User downloads them.

---

## 7. Deployment & Maintenance
*   **Build**: Run `npm run build` in the frontend before deployment.
*   **Hosting**: Copy `backend`, `frontend/.next`, `frontend/public`, and `server.js` to the host.
*   **Maintenance**: Monitor the `AuditLog` table for system changes and user actions.

---
*Created by Antigravity AI - Final Handover Version.*
