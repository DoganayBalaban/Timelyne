# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Timelyne is a fullstack SaaS monorepo for freelancers to track time, manage clients/projects, and generate invoices. The repo has two main packages: `client/` (Next.js) and `server/` (Express.js).

## Commands

### Client (`cd client`)
```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run lint      # ESLint
```

### Server (`cd server`)
```bash
npm run dev       # Start with nodemon + ts-node (watch mode)
npm run build     # Compile TypeScript → dist/
npm start         # Run migrations then start production server
npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma studio                      # Open Prisma database GUI
npx prisma generate                    # Regenerate Prisma client after schema changes
```

### Docker (root)
```bash
docker-compose up --build   # Start all services (PostgreSQL, Redis, server, client)
docker-compose down         # Stop all services
```

## Architecture

### Monorepo Structure
```
timelyne/
├── client/      # Next.js 16 frontend
├── server/      # Express.js 5 backend
└── docker-compose.yml
```

### Frontend (`client/`)

- **Routing**: Next.js App Router with two route groups:
  - `(auth)/` — unauthenticated pages (login, register, password reset, email verification)
  - `(protected)/` — authenticated pages (dashboard, clients, projects, invoices, time-entries, tasks, onboarding)
- **State**: Redux Toolkit (`authSlice`) for auth state; TanStack React Query for server state
- **API Layer**: Axios instances in `lib/api/` with one file per domain (`auth.ts`, `clients.ts`, `projects.ts`, `invoices.ts`, `timeEntries.ts`, `tasks.ts`, `dashboard.ts`)
- **Real-time**: Socket.IO client for live notifications
- **UI**: Radix UI + TailwindCSS 4; forms with React Hook Form + Zod; drag-and-drop Kanban with @dnd-kit; charts with Recharts
- **Path alias**: `@/*` maps to the project root

### Backend (`server/`)

Follows a layered MVC pattern: `routes → controllers → services → Prisma`

- **`src/config/`**: Environment validation (`env.ts`), Prisma (`db.ts`), three Redis clients for pub/sub (`redis.ts`), Socket.IO setup (`socket.ts`), AWS S3 (`s3.ts`)
- **`src/routes/`**: One router per domain, mounted in `src/index.ts`
- **`src/controllers/`**: Request/response handling; delegates business logic to services
- **`src/services/`**: Business logic and database operations via Prisma
- **`src/validators/`**: Zod schemas for all incoming API payloads
- **`src/middlewares/`**: JWT auth (`authMiddleware.ts`), email verification gate (`isVerified.ts`), Redis rate limiting (`redisRateLimit.ts`), file upload (`uploadMiddleware.ts`), global error handler (`errorMiddleware.ts`)
- **`src/workers/`**: BullMQ background workers — `emailWorker.ts` (Resend API) and `pdfWorker.ts` (PDFKit invoice generation)

### Data Layer

- **ORM**: Prisma with PostgreSQL. Schema at `server/prisma/schema.prisma` with models: `User`, `Client`, `Project`, `Task`, `TimeEntry`, `Invoice`, `InvoiceItem`, `Payment`, `Expense`, `Attachment`, `RefreshToken`, `AuditLog`
- **Caching/Queues**: Redis (ioredis) — three clients: main, subscriber, publisher for Socket.IO pub/sub across instances

### Auth Flow

JWT with short-lived access tokens + long-lived refresh tokens stored in HTTP-only cookies. Refresh token rotation is implemented in `authService.ts`. Email verification is required before accessing protected routes (enforced by `isVerified` middleware).

### Key Environment Variables (server)

`PORT`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV`, `FRONTEND_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `RESEND_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME` — all validated at startup in `src/config/env.ts`.

Redis TLS is conditionally enabled only in production (for Upstash compatibility).
