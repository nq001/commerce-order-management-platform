# Architecture Decision Record (ADR): Inventory Concurrency Strategy

## Context
High-traffic e-commerce systems often face scenarios where multiple customers attempt to purchase the same product simultaneously. In our platform, if two users concurrently attempt to buy the last available unit of a product, we must guarantee that:
1. Exactly one purchase succeeds.
2. Inventory NEVER becomes negative.
3. The failed operation receives a deterministic error (InsufficientStockException).

## Alternatives Considered

1. **Optimistic Concurrency Control (OCC) with Version Column (`@VersionColumn`)**:
   - Pros: No database locks; high read throughput.
   - Cons: Prone to high failure rates under heavy contention. When two users read the same version and attempt to update, one will throw an `OptimisticLockVersionMismatchError`, forcing application-level retries.
2. **Redis Distributed Locks**:
   - Pros: Decoupled from the database; very fast.
   - Cons: Adds an extra network hop and dependency. Ensuring consistency between the Redis lock state and the Postgres transaction state can be complex (distributed transactions).
3. **Pessimistic Locking (`SELECT ... FOR UPDATE`)**:
   - Pros: Absolute guarantee of sequential evaluation. Handled natively within the Postgres ACID transaction. Simpler code logic.
   - Cons: Potential for deadlocks if rows are locked in different orders. Slower during extreme contention because it forces serialization.

## Decision
We chose **Pessimistic Locking (`SELECT ... FOR UPDATE`)** alongside our existing Postgres database constraint (`CHECK (available_quantity >= 0)`).

## Rationale
- E-commerce inventory is typically highly constrained during flash sales, meaning that serialization is the *correct* behavior to accurately evaluate sequential stock deductability.
- By wrapping the lock inside a database transaction, we atomically reserve the stock and write the `InventoryMovement` log without any window for race conditions.
- To eliminate the **deadlock** downside of pessimistic locks, the `InventoryService` explicitly sorts items by `product_id` alphabetically before locking. This guarantees that all concurrent transactions acquire row-level locks in the exact same sequence, making deadlocks mathematically impossible in this flow.
- The database `CHECK` constraint acts as a final fail-safe to guarantee integrity even if another process attempts a manual SQL update outside of our application logic.

## Consequences
- The system is perfectly reliable for flash sales.
- Throughput on a single heavily-contended SKU is capped by the database transaction rate (which is easily >10,000 TPS on modern Postgres, well within our modular monolith requirements).
