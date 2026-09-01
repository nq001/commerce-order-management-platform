# Phase 05 — Database Design

## Objective

Create a PostgreSQL design that enforces important correctness rules.

## End-to-End Work

Design:

- ERD
- Tables
- Primary/foreign keys
- Unique constraints
- Check constraints
- Nullable rules
- Timestamps
- Soft-delete policy where justified
- Indexes
- Transactions
- Migrations
- Seed strategy

## Correctness Requirements

Database constraints must help enforce:

- Unique user identity
- Unique product SKU
- Cart-item uniqueness
- Idempotency-key uniqueness
- Payment-event uniqueness
- Referential integrity
- Valid inventory quantities
- Valid status values where appropriate

## Performance

For each important index document:

- Query it supports
- Expected selectivity
- Write/storage trade-off
- How it will be measured

## Exit Criteria

- ERD matches the domain model.
- Migrations create the complete schema from zero.
- Seed data supports realistic demos/tests.
- Critical invariants are protected at database level.
- Rollback strategy is documented.

## Evidence

`docs/reports/02-design/database.md`
`docs/reports/02-design/erd.*`
`database/migrations/*`
`database/seeds/*`
