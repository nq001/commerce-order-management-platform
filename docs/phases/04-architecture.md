# Phase 04 — Architecture & ADRs

## Objective

Turn the domain model into a maintainable production architecture.

## Architecture

Use a Modular Monolith first.

Suggested module boundaries:

- Auth
- Users
- Roles/Permissions
- Catalog
- Inventory
- Cart
- Pricing/Coupons
- Orders
- Payments
- Shipping
- Notifications
- Reviews
- Audit
- Health/Operations

## End-to-End Work

Define:

- Module ownership
- Public interfaces between modules
- Dependency direction
- Transaction boundaries
- Persistence strategy
- Redis responsibilities
- Payment abstraction
- External integration boundaries
- Async processing boundaries
- Configuration boundaries
- Error boundaries

## Required ADR Topics

- Why modular monolith?
- Why PostgreSQL?
- Why Redis?
- ORM/data-access strategy
- Transaction strategy
- Inventory locking/concurrency strategy
- Authentication/token strategy
- RBAC/permissions
- Caching
- Idempotency
- Async processing/queues
- Docker/CI/CD
- Production infrastructure
- Observability

## Exit Criteria

- Architecture diagram exists.
- Every module has a clear responsibility.
- Dependency rules are explicit.
- Important decisions have ADRs.
- No technology is present only because it is fashionable.

## Evidence

`docs/reports/02-design/architecture.md`
`docs/reports/decisions/ADR-*.md`
