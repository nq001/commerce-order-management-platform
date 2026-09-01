# Phase 12 — Orders & Checkout Reliability

## Objective

Build the core order/checkout workflow safely.

## End-to-End Workflow

1. Authenticate customer.
2. Load cart.
3. Validate ownership.
4. Validate products.
5. Validate current prices.
6. Validate coupon.
7. Calculate authoritative totals.
8. Validate/reserve inventory.
9. Create order.
10. Persist immutable order-item/price snapshots.
11. Create payment intent/attempt as designed.
12. Commit transaction where applicable.
13. Return deterministic result.
14. Support retry/idempotency.
15. Emit required observable events/effects.

## Required Reliability

- Idempotency
- Transactions
- State machine
- Inventory concurrency
- Price snapshots
- Failure handling
- Ownership

## Critical Scenarios

- Double-click checkout
- Same idempotency key repeated
- Same request retried after timeout
- Two buyers for last stock
- Database failure
- Payment uncertainty
- API crash after persistence

## Exit Criteria

Checkout is safe enough to be the system's core business workflow and has automated proof for critical failure modes.

## Evidence

`docs/reports/03-reliability/idempotency.md`
`docs/reports/03-reliability/transactions.md`
`docs/reports/03-reliability/failure-modes.md`
E2E + concurrency tests.
