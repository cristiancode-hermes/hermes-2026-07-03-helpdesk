# Architecture Decision Records

## ADR-001: SQLite for Development, PostgreSQL-Ready Schema

**Date:** 2026-07-03

**Context:** The build environment has no access to Neon/PostgreSQL (NEON_API_KEY consistently empty across 20+ runs). We need a working database for development.

**Decision:** Use `sql.js` (pure JavaScript SQLite implementation) for development. Design all schemas to be PostgreSQL-compatible: use `text` for strings, `real` for decimals, `COALESCE` for safe aggregation. Dashboard queries use `strftime` (SQLite) for date functions with migration notes for PostgreSQL's `EXTRACT`.

**Consequences:** Zero-dependency database works in any Node.js environment. Migration to Neon requires updating date functions in dashboard queries.

## ADR-002: Multi-Tenant via organizationId Column

**Date:** 2026-07-03

**Context:** The system needs to support multiple organizations with complete data isolation.

**Decision:** Every entity has an `organizationId` column. All queries include `WHERE organizationId = ?` from the JWT-extracted org ID. No shared tables. No row-level security — full application-level isolation.

**Consequences:** Simple, fast, and database-agnostic. Every controller passes orgId to every service method. Works with both SQLite and PostgreSQL.

## ADR-003: Status Machine Enforcement

**Date:** 2026-07-03

**Context:** Tickets have a lifecycle that must be followed to maintain data consistency.

**Decision:** Enforce valid status transitions in the service layer with a transition map. Invalid transitions return 400 Bad Request. Audit events track every change.

**Consequences:** Data integrity is guaranteed server-side. The frontend shows available actions based on current status. Adding new transitions requires only updating the transition map.

## ADR-004: Separate Audit Events Table

**Date:** 2026-07-03

**Context:** Every ticket action (create, status change, assignment, message) needs to be tracked for accountability.

**Decision:** Use a separate `audit_events` table instead of JSON blobs on the Ticket entity. Each event has `action`, `oldValue`, `newValue`, and `userId`.

**Consequences:** Queryable, sortable, indexable audit trail. Easy to extend with new event types without schema migration.

## ADR-005: Angular Zoneless + Signals

**Date:** 2026-07-03

**Context:** Angular 22 supports zoneless change detection. The project should use modern Angular patterns.

**Decision:** Use `provideZonelessChangeDetection()` with signals for all state management. `@if`/`@for` control flow. No `@Input/@Output` decorators — use `input()`/`output()`.

**Consequences:** Smaller bundle, better performance, more predictable change detection. All state is signal-based with `computed()`, `effect()`, and proper loading/empty/error patterns.

## ADR-006: Tailwind CSS v4 with @theme Design Tokens

**Date:** 2026-07-03

**Context:** The design spec defines a comprehensive design system with colors, typography, spacing, shadows, and animations.

**Decision:** Use Tailwind CSS v4 with `@theme` directives for all design tokens. `postcss.config.js` with `@tailwindcss/postcss` plugin for Angular 22's Vite builder.

**Consequences:** Full design system fidelity. Tailwind v4's CSS-first configuration (`@theme`) replaces the deprecated `tailwind.config.js`. PostCSS approach is required for Angular 22 Vite compatibility.

## ADR-007: Self-Seeding on Startup (OnModuleInit)

**Date:** 2026-07-03

**Context:** The application needs demo data for evaluation without manual setup.

**Decision:** The SeedService implements `OnModuleInit` and checks for existing data before seeding. If no organizations exist, it seeds the database with 1 org, 2 users, 5 customers, 5 categories, 8 tags, and 8 tickets with messages.

**Consequences:** First startup always has demo data. Subsequent startups check for existing data and skip. In production, disable the SeedModule or use a separate seed command.
