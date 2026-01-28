# 🚀 VibeCoder

> **The Premium AI Code Marketplace.** Buy, sell, and discover state-of-the-art AI-generated codebases with total transparency and developer-first aesthetics.

![VibeCoder Cover](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070)

---

## ✨ Features

### 🎨 "Deep Ember" Design System

A hyper-modern, high-contrast dark theme designed for engineers.

- **Vibrant Gradients**: Orange-to-Red pulse effects for critical actions.
- **Glassmorphism**: Translucent surfaces with backdrop blurs.
- **Animated Interactions**: Staggered entry motions and hover glow effects.

### 🛠️ Core Capabilities

- **Premium Marketplace**: Browse AI codebases with detailed metadata and tech stack filters.
- **Interactive Sell Wizard**: A 4-step professional flow for creators to list their work.
- **Real-time Dashboards**: Track sales, performance analytics, and manage purchases.
- **AI Transparency**: Detailed metadata for every listing, including model type, provider, and generation metrics.
- **Secure Storage**: Modernized file management powered by **AWS SDK v3** and presigned URLs.

---

## 🛠️ Tech Stack

| Layer        | Technologies                                                 |
| :----------- | :----------------------------------------------------------- |
| **Frontend** | Next.js 14, Tailwind CSS, Zustand, React Query, Lucide Icons |
| **Backend**  | NestJS (Type-safe Node.js), GraphQL (Apollo), REST API       |
| **Database** | PostgreSQL, Prisma ORM                                       |
| **Caching**  | Redis (ioredis)                                              |
| **Storage**  | AWS S3 (AWS SDK v3)                                          |
| **Security** | JWT (Access & Refresh Tokens), Passport.js                   |

---

## 🚀 Quick Start

### 1. Requirements

- Node.js 20+
- PostgreSQL
- Redis

### 2. Setup

```bash
# Clone the repository
git clone https://github.com/dark1solds/VibeCoder.git
cd VibeCoder

# Install dependencies (Monorepo root)
npm install

# Initialize Database
cd apps/api
npx prisma db push
npm run db:seed

# Start Development Mode
cd ../..
npm run dev
```

### 3. Access

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API (GraphQL)**: [http://localhost:3001/graphql](http://localhost:3001/graphql)

---

## 📁 Repository Structure

```tree
VibeCoder/
├── apps/
│   ├── api/          # NestJS Backend (Modernized with AWS SDK v3)
│   └── web/          # Next.js 14 Frontend (Redesigned with Deep Ember)
├── packages/
│   └── types/        # Shared DTOs and Logic
├── docker-compose.yml # Development infrastructure
└── README.md
```

---

## 🔑 Demo Accounts

Explore the platform using these test accounts:

- **Creator**: `creator@vibecoder.dev` / `password123`
- **Buyer**: `buyer@vibecoder.dev` / `password123`
- **Admin**: `admin@vibecoder.dev` / `password123`

---

## 🏗️ Architecture & Security

- **Type-Safety**: End-to-end TypeScript support across the monorepo.
- **Validated Inputs**: All API requests are sanitized using `class-validator` and GraphQL schema checks.
- **Secure Storage**: Code files are never exposed directly; access is granted via time-limited presigned URLs.
- **Persistent Sessions**: Automated auth hydration using Zustand persistence.

---

## 🗺️ Roadmap

- [ ] **Monaco Editor Integration**: Native code preview for all listings.
- [ ] **Stripe Checkout**: Integrated payment flow for secondary market transactions.
- [ ] **Semantic Search**: AI-powered discovery based on codebase functionality.

---

License: MIT | Created with ❤️ for VibeCoder Developers.
