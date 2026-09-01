# Phase 03 — Domain Modeling

## Objective

Design the business model and invariants before database tables or controllers.

## Core Domains

- User
- Role
- Permission
- Product
- Category
- Inventory
- Inventory Movement
- Cart
- Cart Item
- Coupon
- Order
- Order Item
- Payment
- Payment Event
- Shipment
- Notification
- Review
- Audit Log

## End-to-End Work

For every aggregate:

1. Define responsibility.
2. Define lifecycle.
3. Define valid states.
4. Define invariants.
5. Define commands/actions.
6. Define ownership boundaries.
7. Define relationships.
8. Define what must be atomic.
9. Define what can be asynchronous.

## State Machines

Explicitly model:

- Order lifecycle
- Payment lifecycle
- Shipment lifecycle
- User/account lifecycle where needed
- Inventory reservation lifecycle where applicable

## Critical Invariants

Examples:

- Inventory cannot become negative.
- A customer cannot modify another customer's cart/order.
- Order totals are reproducible from persisted snapshots.
- Invalid state transitions are rejected.
- Duplicate provider events do not create duplicate effects.

## Exit Criteria

- Domain model is implementation-ready.
- State transitions are explicit.
- Invariants are written down.
- Aggregate boundaries are defensible.

## Evidence

`docs/reports/02-design/domain-model.md`
`docs/reports/02-design/state-machines.md`
`docs/reports/02-design/invariants.md`
