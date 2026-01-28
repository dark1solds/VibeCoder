# VibeCoder - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- Redis (or Docker)

### ⚡ Fast Local Setup

```bash
# 1. Start databases (if using Docker)
docker-compose up -d

# 2. Install dependencies (root directory)
npm install

# 3. Initialize Database
cd apps/api
npx prisma db push
npm run db:seed

# 4. Start both servers
cd ../..
npm run dev
```

Your services are now live:

- 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
- 🔌 **API Server**: [http://localhost:3001](http://localhost:3001)
- 📊 **GraphQL API**: [http://localhost:3001/graphql](http://localhost:3001/graphql)

---

## 🎨 New Premium Design: "Deep Ember"

The application now features a high-end dark theme with:

- **Glow Effects**: Interactive orange-red gradients.
- **Glassmorphism**: Translucent surfaces.
- **Animations**: Staggered entry motions.
- **Persistent Auth**: Sessions are saved to local storage automatically.

---

## 🧪 Demo Accounts

Use these credentials to explore the platform:

- **Creator**: `creator@vibecoder.dev` / `password123`
- **Buyer**: `buyer@vibecoder.dev` / `password123`
- **Admin**: `admin@vibecoder.dev` / `password123`

---

## 🛠️ Key GraphQL Mutations

### Register a New Account

```graphql
mutation Register {
  register(
    input: {
      email: "newuser@vibecoder.dev"
      username: "newuser"
      password: "Password123!"
    }
  ) {
    user {
      id
      email
    }
    accessToken
  }
}
```

### Create a Code Listing

```graphql
mutation CreateListing($input: CreateListingInput!) {
  createListing(input: $input) {
    id
    title
    status
  }
}
```

---

## 📁 Project Structure

```
vibecoder/
├── apps/
│   ├── api/          # NestJS (AWS SDK v3, GraphQL, REST)
│   └── web/          # Next.js 14 (Redesigned UI, Zustand, React Query)
├── packages/
│   └── types/        # Shared DTOs and Interfaces
└── PROJECT_STATUS.md # Current roadmap and completion tracking
```

---

## 🐛 Common Commands

| Task           | Command                                                              |
| :------------- | :------------------------------------------------------------------- |
| **Start Dev**  | `npm run dev`                                                        |
| **Reset DB**   | `cd apps/api && npx prisma db push --force-reset && npm run db:seed` |
| **View DB**    | `cd apps/api && npx prisma studio`                                   |
| **Type Check** | `npm run type-check`                                                 |

---

## ✨ Features Implemented

- ✅ **Secure Auth**: JWT with refresh tokens and persistence.
- ✅ **Marketplace**: Browse with Grid/List toggles and category filters.
- ✅ **Seller Flow**: 4-step wizard for listing AI-generated code.
- ✅ **Storage**: AWS SDK v3 integration with pre-signed downloads.
- ✅ **Dashboard**: Analytics summary, purchase history, and listing management.

**Happy Coding! 🚀**
