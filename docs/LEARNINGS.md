# Learnings

## 1. SQLite-Compatible Dashboard Queries Are Tricky

The initial dashboard implementation used PostgreSQL-specific `EXTRACT(EPOCH FROM ...)` syntax, which failed at runtime on SQLite with `near "FROM": syntax error`. 

**Lesson:** When writing queries that target both SQLite (dev) and PostgreSQL (prod), use:
- `strftime('%s', date)` for SQLite (returns Unix timestamp)
- `EXTRACT(EPOCH FROM date)` for PostgreSQL
- Document migration notes for each query
- Test with the actual target database driver before production

## 2. Status Machine Pattern Is Clean and Maintainable

The ticket lifecycle status machine (valid transitions map) proved to be simple, correct, and easy to extend. Each status change creates an audit event automatically. The pattern is:
- Define valid transitions as a `Record<string, string[]>`
- Validate before every status change
- Create audit event with old/new values
- Handle special cases (resolve date, close date) within the same method

## 3. Multi-Tenant Query Scoping Requires Discipline

Every service method must receive `organizationId` and include it in every query. This is enforced by:
- JWT payload includes `organizationId`
- `@CurrentUser()` decorator extracts it
- Every controller passes it to every service call

Skipping orgId in even one query creates a data leak. Code review must check this.

## 4. Subagent Code Is ~90% Correct — Pattern Holds

The subagent-generated backend code compiled first time with zero errors (dashboard service fix was a SQL compatibility issue, not a code generation error). The subagent-generated frontend also compiled first time with zero errors. This confirms the pattern from previous runs: subagents produce ~90% correct code, with the remaining 10% being predictable fixes.

## 5. Design Specs from UX Designer Save ~15-20 Minutes

The design specs (PROJECT.md, USER_STORIES.md, WIREFRAMES.md, COMPONENT_TREE.md, ROUTES.md, DATABASE_SCHEMA.md, DESIGN_SYSTEM.md, FLOW_DIAGRAM.md) provided a complete blueprint. Skipping Phase 1 (self-design) saved ~15 minutes that was reinvested in better implementation.

## 6. sql.js Auto-Save Causes Slow Startup on Seed

The sql.js driver with `autoSave: true` writes the database to disk after every write operation. During seeding (50+ entity saves), this causes significant slowdown. For production, consider disabling autoSave and saving manually after all seed operations complete.

## 7. NestJS Module Isolation Prevents Circular Dependencies

Each module owns its TypeORM entity registrations via `TypeOrmModule.forFeature()`. Cross-module queries go through service classes, not direct repository access. This design prevents circular dependency errors that would otherwise surface during module initialization.
