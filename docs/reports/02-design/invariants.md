# Critical Invariants

The following rules represent the undeniable truths of the Qubrax system. The architecture, database schema, and application logic must mathematically and logically guarantee these invariants at all times.

## 1. Inventory Truth
**Invariant:** `Available Inventory >= 0` always.
**Enforcement:** Must be enforced by a PostgreSQL `CHECK` constraint (e.g., `CHECK (available_quantity >= 0)`). Application code cannot be solely trusted due to race conditions. Over-selling is impossible under this rule.

## 2. Order Immutability
**Invariant:** An Order's financial and fulfillment data is isolated from future catalog changes.
**Enforcement:** When an order is created, the system must copy the exact price, product name, and shipping address into the order tables (`order_items`, `order_address_snapshots`). A change to a Product's price tomorrow cannot retroactively change an Order's total from today.

## 3. Webhook Idempotency (Exactly-Once Processing)
**Invariant:** A payment event from a provider can trigger side-effects (status updates, emails) exactly once.
**Enforcement:** Must be enforced by a `UNIQUE` constraint on the provider's `event_id` in a `payment_events` table. If a duplicate webhook arrives, the DB rejects the insert, the application catches the error, and immediately returns a `200 OK` to the provider without executing side-effects.

## 4. Checkout Idempotency
**Invariant:** Submitting the same checkout payload with the same `Idempotency-Key` must never result in duplicate orders or duplicate charges.
**Enforcement:** Must be enforced by a `UNIQUE` constraint on `(user_id, idempotency_key)` in an `idempotency_keys` table. The key is written in the exact same transaction as the order creation.

## 5. Security & Isolation
**Invariant:** A user can only view or mutate data belonging to their own Tenant/ID.
**Enforcement:** The authorization layer must strictly validate `resource.owner_id == request.user.id`. Controllers must not trust ID parameters in the URL without this check.

## 6. Atomic State Transitions
**Invariant:** A multi-aggregate mutation (e.g., Checkout: Clear Cart + Reserve Stock + Create Order) must either fully succeed or fully fail.
**Enforcement:** Must be wrapped in a single PostgreSQL `TRANSACTION`. Partial failures (e.g., Order created but inventory not deducted) are unacceptable.

## 7. State Machine Enforcement
**Invariant:** Entities cannot skip or reverse critical states un-modeled.
**Enforcement:** E.g., A `DELIVERED` order cannot transition back to `PENDING`. This must be validated by a strict domain service acting as a state machine.
