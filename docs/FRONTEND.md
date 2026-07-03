# Frontend Architecture

## Stack

- **Angular 22** — standalone components, zoneless change detection
- **Signals** — all state via `signal()`, `computed()`, `input()`, `output()`
- **Tailwind CSS v4** — `@theme` design tokens, PostCSS build
- **TypeScript** — strict mode

## State Management

All state is signal-based. No NgRx, no RxJS state stores:

```typescript
// Component state pattern
readonly items = signal<Item[]>([]);
readonly loading = signal(true);
readonly error = signal<string | null>(null);

// Template
@if (loading()) { <app-loading-skeleton type="table" /> }
@else if (error()) { <app-error-state [message]="error()" (retry)="load()" /> }
@else if (items().length === 0) { <app-empty-state ... /> }
@else {
  @for (item of items(); track item.id) { ... }
}
```

## Component Architecture

### Pages (lazy-loaded)
| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPageComponent | Email + password login |
| `/register` | RegisterPageComponent | Org + user registration |
| `/dashboard` | DashboardPageComponent | KPIs, SVG charts, urgent tickets |
| `/tickets` | TicketListPageComponent | Filtered ticket table |
| `/tickets/new` | TicketFormComponent | Create ticket |
| `/tickets/:id` | TicketDetailComponent | Detail + conversation thread |
| `/tickets/:id/edit` | TicketFormComponent | Edit ticket |
| `/customers` | CustomerListPageComponent | Customer CRUD table |
| `/customers/:id` | CustomerDetailPageComponent | Customer info + tickets |
| `/settings` | SettingsPageComponent | Categories, tags, users |
| `/portal/tickets` | CustomerTicketListComponent | Customer's tickets |
| `/portal/tickets/new` | CustomerTicketFormComponent | Create ticket (customer) |
| `/portal/tickets/:id` | CustomerTicketDetailComponent | Detail + comment (customer) |

### Layout Components
- **AppShellComponent** — Sidebar, top bar, content area (agent)
- **CustomerLayoutComponent** — Simplified layout (customer portal)
- **AuthLayoutComponent** — Minimal layout for login/register

### Shared Components (12)
Button, Badge, PriorityDot, Modal, ConfirmDialog, Toast, LoadingSkeleton, EmptyState, ErrorState, Pagination, SearchModal (Ctrl+K), DatePicker

## Services (10)
All services use Angular's `HttpClient` with `inject()` and signals for state:

- `AuthService` — login, register, logout, currentUser, isAuthenticated
- `TicketService` — CRUD, filter, status/assign operations
- `MessageService` — list/create messages per ticket
- `CustomerService` — CRUD customers
- `CategoryService` — CRUD categories
- `TagService` — CRUD tags
- `UserService` — list agents, change roles
- `DashboardService` — KPIs + chart data
- `SearchService` — global search
- `ThemeService` — dark mode toggle + localStorage

## Interceptors
- **AuthInterceptor** — Attaches JWT to all requests
- **ErrorHandlerInterceptor** — Catches 401 → redirect to login

## Dark Mode
Toggled by adding/removing `class="dark"` on `<html>`. Persisted in `localStorage`. Uses Tailwind v4 `@custom-variant dark` directive. Initial state from `prefers-color-scheme`.

## Build Performance

- Initial bundle: 289 KB JS + 24 KB CSS (313 KB total)
- 38+ lazy chunks for route-level code splitting
- Build time: ~7.3 seconds
