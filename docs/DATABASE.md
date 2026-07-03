# Database Schema

## ER Diagram

```mermaid
erDiagram
    Organization ||--o{ User : "tiene"
    Organization ||--o{ Customer : "atiende"
    Organization ||--o{ Category : "configura"
    Organization ||--o{ Tag : "usa"
    
    User ||--o{ Ticket : "asignado"
    User ||--o{ TicketMessage : "escribe"
    
    Customer ||--o{ Ticket : "crea"
    
    Category ||--o{ Ticket : "clasifica"
    
    Ticket ||--o{ TicketMessage : "tiene"
    Ticket ||--o{ TicketTag : "etiquetado"
    Ticket ||--o{ AuditEvent : "historial"
    Ticket ||--|| Customer : "pertenece"
    Ticket ||--o| User : "asignado"
    
    Tag ||--o{ TicketTag : "usado en"
    
    Organization {
        int id PK
        string name
        string slug UK
        datetime createdAt
    }
    
    User {
        int id PK
        int organizationId FK
        string name
        string email UK
        string password "select: false"
        string role "admin | agent"
        datetime createdAt
    }
    
    Customer {
        int id PK
        int organizationId FK
        string name
        string email
        string phone "nullable"
        datetime createdAt
    }
    
    Category {
        int id PK
        int organizationId FK
        string name
        string color "#6366f1"
        string description "nullable"
        int sortOrder
        datetime createdAt
    }
    
    Tag {
        int id PK
        int organizationId FK
        string name
        string color "#737373"
        datetime createdAt
    }
    
    Ticket {
        int id PK
        int organizationId FK
        int customerId FK
        int categoryId FK "nullable"
        int assignedToId FK "nullable"
        string title
        string description
        string status "new|open|in_progress|resolved|closed"
        string priority "low|medium|high|urgent"
        datetime createdAt
        datetime updatedAt
        datetime resolvedAt "nullable"
        datetime closedAt "nullable"
    }
    
    TicketMessage {
        int id PK
        int ticketId FK
        int userId FK "nullable"
        int customerId FK "nullable"
        string content
        boolean isInternal
        string authorType "agent|customer|system"
        datetime createdAt
    }
    
    TicketTag {
        int ticketId FK "PK"
        int tagId FK "PK"
    }
    
    AuditEvent {
        int id PK
        int ticketId FK
        int userId FK "nullable"
        string action
        string oldValue "nullable"
        string newValue "nullable"
        datetime createdAt
    }
```

## Migration Strategy

TypeORM `synchronize: true` is used for development. For production, use TypeORM migrations or a dedicated migration tool. The schema is PostgreSQL-compatible.

## Key Queries

### Dashboard KPIs (SQLite-compatible)

```sql
-- Tickets by status
SELECT status, COUNT(*) as count FROM tickets
WHERE organizationId = ? GROUP BY status;

-- Active tickets by priority
SELECT priority, COUNT(*) as count FROM tickets
WHERE organizationId = ? AND status NOT IN ('resolved', 'closed')
GROUP BY priority;

-- Average resolution time (hours)
SELECT COALESCE(AVG(
  (strftime('%s', resolvedAt) - strftime('%s', createdAt)) / 3600.0
), 0) as avgHours FROM tickets
WHERE organizationId = ? AND status = 'resolved' AND resolvedAt IS NOT NULL;
```

### Urgent Unassigned Tickets

```sql
SELECT t.*, c.name as customerName FROM tickets t
JOIN customers c ON c.id = t.customerId
WHERE t.organizationId = ? AND t.priority = 'urgent'
AND t.assignedToId IS NULL AND t.status NOT IN ('resolved', 'closed')
ORDER BY t.createdAt ASC;
```

### Filtered Ticket List

```sql
SELECT t.*, c.name as customerName, u.name as agentName
FROM tickets t
LEFT JOIN customers c ON c.id = t.customerId
LEFT JOIN users u ON u.id = t.assignedToId
WHERE t.organizationId = ?
ORDER BY CASE t.priority
  WHEN 'urgent' THEN 0 WHEN 'high' THEN 1
  WHEN 'medium' THEN 2 WHEN 'low' THEN 3
END ASC, t.createdAt DESC
LIMIT ? OFFSET ?;
```

## Neon/PostgreSQL Compatibility

The schema uses:
- `text` for strings (maps to TEXT in SQLite, VARCHAR/TEXT in PostgreSQL)
- `real` for decimals (maps to REAL in SQLite, DOUBLE PRECISION in PostgreSQL)
- `COALESCE` for safe aggregation (supported in both)
- `strftime` for date functions (SQLite) — use `EXTRACT` for PostgreSQL

For PostgreSQL migration, update date functions in dashboard queries.
