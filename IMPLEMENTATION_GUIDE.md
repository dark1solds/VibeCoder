# VibeCoder - System Implementation Guide

## 🎨 Overview

VibeCoder is a premium marketplace for AI-generated codebases. It is built using a monorepo architecture with a NestJS backend and a Next.js 14 frontend, featuring a custom "Deep Ember" dark theme.

---

## ✅ Core Modules & Implementation Status

### 1. **Authentication**

- **Backend**: JWT-based session management with refresh tokens.
- **Frontend**: Redesigned Login & Register pages with **Zustand Persistence**.
- **Roles**: Standardized on `USER`, `CREATOR`, and `ADMIN`.

### 2. **Listings & Marketplace**

- **CRUD**: Full lifecycle from Draft to Published.
- **Wizard**: A 4-step interactive frontend flow for "Selling" code.
- **Search**: Advanced filtering by category, price, rating, and tech stack.
- **Redesign**: Premium marketplace UI with list/grid toggles and staggered animations.

### 3. **Storage (Modernized)**

- **AWS SDK v3**: Fully migrated to `@aws-sdk/client-s3`.
- **Security**: Presigned URLs for time-limited secure downloads.
- **Flexibility**: Graceful fallback if S3 credentials are missing in dev.

### 4. **Payments (Hybrid)**

- **Backend**: Stripe integration initialized with support for one-time purchases and subscriptions.
- **Status**: Secure backend logic is ready; frontend checkout UI is planned for next.

---

## 🚀 Development Configuration

### Environment Variables (`apps/api/.env`)

```env
# Server
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/vibecoder"

# JWT
JWT_SECRET="vibecoder-secret-key"
JWT_REFRESH_SECRET="vibecoder-refresh-secret"

# AWS S3 (v3)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="test"
AWS_SECRET_ACCESS_KEY="test"
AWS_S3_BUCKET="vibecoder-files"
```

### GraphQL API

- **Endpoint**: `http://localhost:3001/graphql`
- **Playground**: Active in development mode.

---

## 📁 Key File Structure

```bash
apps/
├── api/
│   ├── src/modules/
│   │   ├── listings/    # Core logic, Resolver (GQL), Controller (REST)
│   │   ├── auth/        # JWT strategies, Guards, Session logic
│   │   ├── storage/     # AWS SDK v3 S3 Service
│   │   └── payments/    # Stripe Service & Checkout logic
├── web/
│   ├── src/app/         # Next.js 14 App Router (Redesigned)
│   ├── src/lib/api-client.ts # Typed GraphQL wrapper
│   └── src/lib/stores/  # Zustand persistence stores
packages/
└── types/               # Shared DTOs and Type Definitions
```

---

## ⚡ Technical Roadmap & Next Steps

1. **Monaco Integration**: Moving from static `textareas` to active Monaco components on the Listing Detail and Sell pages.
2. **File Download UI**: Connecting the dashboard "Download" buttons to the presigned URL generator in `S3Service`.
3. **Analytics**: Implementing the Dashboards' stats cards with real backend data aggregations.

---

## 🐛 Debugging Guide

- **Port Conflicts**: If port 3001 is in use, use `netstat -ano | findstr :3001` or `Get-NetTCPConnection` to clear the process.
- **DB Reset**: `npx prisma db push --force-reset && npm run db:seed` from `apps/api`.
- **Auth Issues**: Clear local storage in browser to reset Zustand persistent state.

---

_This guide reflects the state of the system as of January 28, 2026._
