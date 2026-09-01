# Transaction Strategy

## Overview

The checkout process modifies multiple domain entities (Orders, Order Items, Address Snapshots, and the Cart). If any of these modifications fail halfway through, the database could be left in an inconsistent state (e.g., an order is created, but the cart is not emptied).

To prevent this, the checkout workflow uses **Database Transactions** to ensure ACID (Atomicity, Consistency, Isolation, Durability) properties.

## Scope of the Transaction

The database transaction deliberately wraps only the core relational state changes. It does **not** wrap external network calls or inventory reservations to keep the transaction duration as short as possible, avoiding long-held database locks.

### Pre-Transaction (Outside Scope)
1. **Idempotency Registration:** The in-progress lock is acquired.
2. **Inventory Reservation:** Stock is reserved via `InventoryService` before the main transaction begins.

### Transaction Scope
The following operations are executed within a single `dataSource.transaction`:

1. **Create Order:** The core `Order` record is created with its pending status and calculated totals.
2. **Create Order Items (Snapshots):** Each item in the cart is mapped to an `OrderItem`. Crucially, we store snapshots of the product data (`product_name_snapshot`, `sku_snapshot`, `unit_price_snapshot`) so the order remains immutable even if the product's price or name changes in the future.
3. **Create Address Snapshot:** The shipping/billing address is copied to an `OrderAddressSnapshot`. This ensures the order's historical address doesn't change if the user updates their profile address later.
4. **Empty Cart:** The `CartItem`s belonging to the user are removed, and any applied `coupon_id` is cleared from the `Cart`.

If any of these steps fail, the transaction is automatically rolled back by TypeORM.

### Post-Transaction (Outside Scope)
1. **Save Idempotency Response:** The final order is cached.

## Compensating Transactions

Because Inventory Reservation happens *outside* the main database transaction, a failure in the main transaction (or anywhere else in the `try` block) requires a **compensating action**.

If an error is thrown, the `catch` block executes:
```typescript
await this.inventoryService.releaseInventory(orderId);
```
This safely releases the reserved stock back into the available pool, ensuring no inventory is "lost" due to a failed checkout.

## Trade-offs and Decisions

- **Why not put Inventory inside the transaction?** Inventory often requires row-level locking (e.g., `SELECT ... FOR UPDATE`). Holding this lock while inserting multiple order and cart rows would decrease concurrency and throughput for high-demand products. Reserving first and compensating on failure provides higher availability.
