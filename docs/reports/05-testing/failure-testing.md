# Failure Mode & Concurrency Testing

## Philosophy
In distributed and complex systems, failures are guaranteed. Our system must degrade gracefully, prevent data corruption, and allow users to retry safely.

## Idempotency & Checkout Failures
When a user initiates checkout, an `IdempotencyKey` is generated and saved. If the payment provider call fails, or if a database validation throws an error later in the chain, we must release that key.

**Test Case: `failure-modes.e2e-spec.ts`**
We simulate an internal failure during checkout. We verify that the transaction rolls back the initial order creation AND removes the `IdempotencyKey` from the database. This ensures the user isn't permanently locked out of checking out if a transient error occurs.

## Concurrency & Race Conditions
**Test Case: `inventory.concurrency.e2e-spec.ts`**
We simulate multiple concurrent users attempting to purchase the last item in stock simultaneously via `Promise.all()`. We verify that the database's `CHECK (quantity >= 0)` constraint, combined with TypeORM transactions, ensures only one user succeeds and the rest receive graceful "Out of Stock" rejections.

## Provider Webhook Duplication
**Test Case: `payments-shipping.e2e-spec.ts`**
External providers often send duplicate webhooks. Our failure testing simulates sending the exact same payload twice. The system successfully processes the first and ignores the second while still returning `200 OK` to prevent the provider from retrying.
