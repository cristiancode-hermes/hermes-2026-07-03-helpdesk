# API Reference

Base URL: `http://localhost:3000/api`

## Authentication

All authenticated endpoints require `Authorization: Bearer <token>` header. Tokens are obtained via `POST /api/auth/login` or `POST /api/auth/register`.

### POST /api/auth/register
Register a new organization with admin user.

```json
{ "name": "John", "email": "john@org.com", "password": "secret123", "organizationName": "My Org" }
```
→ `{ "token": "jwt...", "user": { "id": 1, "name": "...", "role": "admin", "organizationId": 1 } }`

### POST /api/auth/login
Login with email and password.

```json
{ "email": "ana@soportetech.com", "password": "admin123" }
```
→ `{ "token": "jwt...", "user": { ... } }`

### GET /api/auth/me
Returns current user profile.

→ `{ "id": 1, "name": "Ana Martínez", "email": "ana@...", "role": "admin", "organizationId": 1 }`

## Tickets

### GET /api/tickets
List tickets with filters.

Query params: `?status=&priority=&categoryId=&agentId=&q=&page=1&limit=10&sortBy=&sortDir=`

→ `{ "data": [Ticket], "total": 8, "page": 1, "limit": 10 }`

### GET /api/tickets/:id
Get ticket detail with messages, customer, category, assignedTo, tags, and auditLog.

→ `Ticket & { messages: TicketMessage[], auditLog: AuditEvent[], ticketTags: TicketTag[] }`

### POST /api/tickets
Create a new ticket.

```json
{
  "title": "Error en login",
  "description": "No puedo iniciar sesión",
  "categoryId": 1,
  "priority": "urgent",
  "customerId": 1,
  "tagIds": [1, 2]
}
```
Or create a customer on the fly: `{ "customerName": "New", "customerEmail": "new@email.com", ... }`

### PATCH /api/tickets/:id
Update ticket fields (title, description, categoryId, priority, tagIds).

### PATCH /api/tickets/:id/status
Change ticket status (with validation).

```json
{ "status": "open" }
```

Valid transitions: `new→open`, `open→in_progress`, `in_progress→resolved`, `resolved→closed`, `closed→open`, `open→closed`

### PATCH /api/tickets/:id/assign
Assign ticket to an agent.

```json
{ "agentId": 1 }
```

### DELETE /api/tickets/:id
Delete ticket.

## Messages

### GET /api/tickets/:ticketId/messages
List all messages for a ticket.

### POST /api/tickets/:ticketId/messages
Add a message (or internal note).

```json
{ "content": "We're working on it", "isInternal": false }
```
For internal notes: `{ "content": "Internal note", "isInternal": true }`

## Customers

### GET /api/customers
List customers. Query: `?q=&page=1&limit=10`
### GET /api/customers/:id
Get customer with tickets.
### POST /api/customers
Create customer: `{ "name": "...", "email": "...", "phone?": "..." }`
### PATCH /api/customers/:id
Update customer.
### DELETE /api/customers/:id
Delete customer.

## Categories

Full CRUD at `/api/categories`.
Create: `{ "name": "Login", "color": "#6366f1", "description?": "..." }`

## Tags

List, create, delete at `/api/tags`.
Create: `{ "name": "urgente", "color?": "#ef4444" }`

## Users

### GET /api/users
List agents in organization.
### PATCH /api/users/:id/role
Change role: `{ "role": "admin" }`

## Dashboard

### GET /api/dashboard/summary?days=7
Returns:
```json
{
  "kpis": { "openTickets": 2, "pendingTickets": 2, "resolvedToday": 0, "avgResolutionTime": 24.5 },
  "statusDistribution": [{ "label": "new", "count": 2, "color": "#6366f1" }, ...],
  "priorityDistribution": [{ "label": "urgent", "count": 2, "color": "#ef4444" }, ...],
  "trend": [{ "day": "2026-06-26", "created": 1, "resolved": 0 }, ...],
  "urgentUnassigned": [Ticket, ...],
  "agentStats": [{ "agentName": "Ana Martínez", "ticketCount": 3 }, ...]
}
```

## Search

### GET /api/search?q=error&limit=10
Global search across tickets and customers.

→ `{ "tickets": [Ticket], "customers": [Customer] }`

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Invalid transition |
| 401 | Unauthorized (no token / invalid credentials) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, etc.) |
| 500 | Server Error |
