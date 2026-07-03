# Architecture

## System Diagram

```mermaid
graph TD
    A[Agent Browser] --> F[Angular SPA]
    C[Customer Browser] --> F
    F --> API[NestJS REST API :3000]
    API --> DB[(SQLite/PostgreSQL)]
    
    subgraph "Angular Frontend"
        F -->|Auth| AuthService
        F -->|Tickets| TicketService
        F -->|Dashboard| DashboardService
        F -->|Admin| CategoryService
    end
    
    subgraph "NestJS Backend"
        API --> AuthModule
        API --> TicketsModule
        API --> MessagesModule
        API --> CustomersModule
        API --> DashboardModule
        API --> SearchModule
        API --> CategoriesModule
        API --> TagsModule
        API --> UsersModule
        AuthModule --> JWTStrategy
    end
```

## Data Flow

```mermaid
sequenceDiagram
    participant A as Agent
    participant F as Angular Frontend
    participant API as NestJS API
    participant DB as SQLite

    A->>F: Login (email + password)
    F->>API: POST /api/auth/login
    API->>DB: Find user
    API->>API: bcrypt.compare
    API-->>F: JWT token (sub, email, organizationId, role)
    F->>F: Store token in localStorage

    A->>F: Create ticket
    F->>API: POST /api/tickets (JWT)
    API->>API: Extract orgId from JWT
    API->>DB: INSERT ticket (org-scoped)
    API->>DB: INSERT audit event
    DB-->>API: Created ticket
    API-->>F: Ticket + audit

    A->>F: Respond to ticket
    F->>API: POST /api/tickets/:id/messages
    API->>DB: INSERT message
    API->>DB: UPDATE ticket (new → open if needed)
    API->>DB: INSERT audit
    DB-->>API: Updated
    API-->>F: Message + updated ticket
    F->>F: Append to conversation thread
```

## Architecture Decisions

### Monorepo Structure
The project uses a simple monorepo with `apps/api` (NestJS) and `apps/web` (Angular). Each has its own `package.json`, `tsconfig.json`, and build pipeline. The root contains documentation and the `.gitignore`.

### Multi-Tenant Architecture
Every entity is scoped by `organizationId`. JWT payload includes `organizationId` and `role`. Every controller extracts the orgId from the current user and passes it to every service method. This ensures data isolation between organizations.

### Status Machine
The ticket lifecycle is enforced server-side with valid transitions:
- `new → open` (agent takes ticket)
- `open → in_progress` (agent working)
- `in_progress → resolved` (solution proposed)
- `resolved → closed` (customer confirms)
- `closed → open` (reopen)
- `open → closed` (direct close)

Invalid transitions return 400 Bad Request.

### Separated Detail Tables
Messages, tags, and audit events are stored in separate tables (not JSON blobs on Ticket) to enable ordering, querying, and future extensions.
