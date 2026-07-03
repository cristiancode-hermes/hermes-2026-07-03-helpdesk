# HelpDesk — Multi-Tenant Support Ticket System

> Plataforma multi-inquilino de tickets de soporte con gestión de prioridades, SLA tracking, conversaciones en hilo y dashboard de métricas para equipos de customer support.

![Status](https://img.shields.io/badge/build-passing-brightgreen)
![Angular](https://img.shields.io/badge/Angular-22-red)
![NestJS](https://img.shields.io/badge/NestJS-11-ea2845)
![TypeORM](https://img.shields.io/badge/TypeORM-1.0-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06b6d4)

## Features

- **Multi-tenant JWT auth** — Register organizations, invite agents, manage roles
- **Ticket management** — Create, assign, prioritize, and track tickets through a status workflow (New → Open → In Progress → Resolved → Closed)
- **Conversation threads** — Agent-customer messaging with internal notes (visible only to agents)
- **Dashboard & analytics** — KPI cards, SVG bar charts (status/priority), 7-day trend line, urgent tickets table
- **Customer portal** — Separate customer login to view tickets, add comments (no management controls)
- **Admin settings** — Manage categories (with colors), tags, and agent roles
- **Global search** — Ctrl+K search across tickets and customers
- **Dark mode** — Full dark mode with custom `@theme` design tokens
- **Audit trail** — Every ticket action logged (status changes, assignments, messages)
- **Responsive design** — Desktop sidebar + mobile bottom nav

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (standalone, signals, zoneless, Tailwind CSS v4) |
| Backend | NestJS 11 (modules, JWT auth, Swagger, TypeORM) |
| Database | SQLite (dev, sql.js) / PostgreSQL-ready schema (prod) |
| UI System | Tailwind CSS v4 with `@theme` design tokens |
| Auth | JWT with Passport.js, bcryptjs, multi-tenant scoping |

## Architecture Overview

```
Monorepo root
├── apps/
│   ├── api/          # NestJS backend (9 entities, 10 modules, 32+ endpoints)
│   └── web/          # Angular frontend (8 pages, 32+ components, 9 services)
├── docs/             # All documentation
└── README.md
```

## Prerequisites

- Node.js 22+
- npm 10+

## Local Setup

### 1. Clone and install dependencies

```bash
cd apps/api && npm install
cd apps/web && npm install
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
# Edit .env if needed (defaults work for development)
```

Default `.env`:
```
PORT=3000
DATABASE_PATH=data/helpdesk.sqlite
JWT_SECRET=change-me-in-production
```

### 3. Run database migrations (auto-sync)

TypeORM sync is enabled for development. The database is created automatically on first run with seed data.

### 4. Start the backend

```bash
cd apps/api
npm run build    # Compile TypeScript
npm start        # Start server on :3000
```

The API will auto-seed with demo data:
- **Organization:** SoporteTech
- **Agents:** Ana Martínez (admin/admin123), Carlos López (agent/agent123)
- **Customers:** 5 customers
- **Tickets:** 8 tickets across various states/priorities
- **Categories:** 5 support categories
- **Tags:** 8 tags

### 5. Start the frontend

```bash
cd apps/web
npm run start    # Dev server on :4200
```

Or build and serve:

```bash
node_modules/.bin/ng build
# Serve dist/helpdesk-web with any static server
```

### 6. Login

- **Agent:** `ana@soportetech.com` / `admin123`
- **Customer portal:** Register a new customer account via `/login`

## API Documentation

Once the backend is running, visit [http://localhost:3000/api/docs](http://localhost:3000/api/docs) for Swagger UI.

## Project Structure

```
apps/api/src/
├── auth/              # JWT auth (register, login, me)
├── users/             # Agent management
├── customers/         # Customer CRUD
├── categories/        # Category CRUD
├── tags/              # Tag CRUD
├── tickets/           # Ticket CRUD + status machine + assignment
├── messages/          # Ticket messages
├── dashboard/         # KPIs, charts, trends
├── search/            # Global search
├── seed/              # Auto-seed on startup
└── common/
    ├── entities/      # 9 TypeORM entities
    ├── decorators/    # @CurrentUser decorator
    └── filters/       # HTTP exception filter

apps/web/src/app/
├── pages/
│   ├── login/         # Login page
│   ├── register/      # Registration page
│   ├── dashboard/     # KPI dashboard with SVG charts
│   ├── tickets/       # Ticket list, detail, form
│   ├── customers/     # Customer list, detail
│   └── settings/      # Categories, tags, users
├── portal/            # Customer portal (ticket view only)
├── shared/            # 12 shared components
├── services/          # 10 services
└── interceptors/      # Auth + error interceptors
```

## Roadmap

- [ ] SSE real-time notifications for new messages
- [ ] File attachments on tickets
- [ ] Quick reply templates for agents
- [ ] Email integration (receive tickets from email)
- [ ] Knowledge base (FAQ articles)
- [ ] CSV export of tickets
- [ ] E2E tests with Playwright
- [ ] GitHub Actions CI pipeline
- [ ] Neon PostgreSQL migration
