# Database Logical Design

This document details the exact constraints, indexes, and performance tradeoffs for the Qubrax PostgreSQL database.

## 1. Primary Keys & Data Types
All tables use `UUID` (specifically UUIDv4) for primary keys rather than auto-incrementing integers.
- **Why:** Prevents ID enumeration (e.g., guessing order IDs), highly scalable, and simplifies merging records if we ever move to distributed databases.
- **Cost:** UUIDs are 16 bytes vs 4/8 bytes for integers, resulting in slightly larger indexes.

All monetary values are stored as `integer` representing **Minor Units** (e.g., cents). Floating point (`DECIMAL`/`FLOAT`) is strictly prohibited for money.

## 2. Core Correctness Rules (Database Constraints)

### Unique Constraints (UK)
- `users.email`: Ensures identity uniqueness.
- `products.sku`: Prevents catalog duplication.
- `cart_items(cart_id, product_id)`: A cart cannot have two separate rows for the same product; they must be merged into one quantity.
- `idempotency_keys(user_id, key)`: Prevents processing the exact same checkout payload twice for a user.
- `payment_events(provider_event_id)`: Webhook deduplication. If Stripe sends event `evt_123` twice, the DB rejects the second insert.

### Check Constraints (CHECK)
- `inventories.available_quantity >= 0`: The most critical invariant. The database physically prevents overselling.
- `cart_items.quantity > 0`: Carts cannot have 0 or negative items.
- `order_items.quantity > 0`: Orders cannot contain negative quantities.

## 3. Indexing Strategy & Performance

Indexes are not free; they cost storage and slow down `INSERT`/`UPDATE` operations. We only index what we frequently query.

### High-Priority Indexes
| Table | Column(s) | Query Supported | Selectivity | Trade-off |
|-------|-----------|-----------------|-------------|-----------|
| `users` | `email` (UNIQUE) | Login lookup | Very High | Negligible write cost. |
| `products` | `category_id` | Catalog browsing by category | Medium | Moderate write cost, high read benefit. |
| `products` | `sku` (UNIQUE) | Catalog admin searches | Very High | Negligible write cost. |
| `orders` | `user_id` | Customer viewing their order history | High | Frequent writes during checkout, but critical for read performance. |
| `orders` | `status` | Admin filtering active/pending orders | Low | High write cost (status changes often). Necessary for admin dashboards. |
| `payment_events` | `provider_event_id` (UNIQUE)| Webhook deduplication | Very High | Absolutely critical for financial correctness. |

## 4. Timestamps & Soft Deletes
All tables include `created_at` and `updated_at` timestamps (managed automatically by TypeORM).

### Soft Delete Policy
Soft deletes (`deleted_at` timestamp) are used only where auditing or referential integrity requires it:
- `users`: Soft deleted. We must preserve user records if they have historical orders.
- `products`: Soft deleted (archived). We cannot delete products referenced by past orders.
- `categories`: Soft deleted.

We do **not** soft delete:
- `cart_items`: Ephemeral data. Hard delete when removed.
- `idempotency_keys`: Ephemeral data. Can be truncated/hard deleted after X days.

## 5. Transactions
All cross-table mutations (Checkout, Webhook processing) are wrapped in `BEGIN ... COMMIT` blocks. TypeORM's `QueryRunner` will be used to manage this at the application layer.
