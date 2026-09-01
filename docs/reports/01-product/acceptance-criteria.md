# Acceptance Criteria for Critical Workflows

## Workflow Format
`Input → Validation → Business Rules → State Change → Persistence → External Effects → Failure Behavior → Observable Evidence`

## 1. Authentication: User Login

**Input:** Email, Password.
**Validation:** Email format is valid, password string is not empty.
**Business Rules:** 
- Email must exist in the system.
- Password hash must match.
- User account status must be active (not suspended).
**State Change:** Refresh token generated (or updated).
**Persistence:** Refresh token securely stored/hashed in DB. Last login timestamp updated.
**External Effects:** None.
**Failure Behavior:** 
- Invalid credentials: 401 Unauthorized (do not leak whether email exists).
- Server error: 500 Internal Server Error.
**Observable Evidence:** 
- JWT access token and refresh token returned to the client. 
- Audit log captures failed login attempts.

## 2. Inventory: Add to Cart

**Input:** Customer ID, Product ID, Quantity.
**Validation:** IDs are UUIDs, Quantity > 0.
**Business Rules:**
- Product must exist and be active.
- Quantity requested must not exceed max allowed per cart.
**State Change:** Cart item added or quantity incremented.
**Persistence:** Updated cart state saved in PostgreSQL.
**External Effects:** None.
**Failure Behavior:** 
- Product not found: 404 Not Found.
- Validation fail: 400 Bad Request.
**Observable Evidence:** API returns updated cart entity with correct subtotal.

## 3. Order Management: Checkout (Critical)

**Input:** Customer ID, Cart ID, Shipping Address, Idempotency-Key.
**Validation:** Valid Idempotency-Key header, valid address DTO, non-empty Cart.
**Business Rules:**
- Idempotency key must not have been previously processed for a different result.
- Prices must be recalculated against the DB source of truth (reject stale cart prices).
- Coupon rules (if applied) must still be valid.
- Inventory must have sufficient available stock.
**State Change:** 
- Cart finalized/cleared.
- Inventory reserved/locked.
- Order created (`PENDING`).
**Persistence (Atomic Transaction):** 
1. Insert Order with Historical Snapshots (price, product name, address).
2. Insert Order Items.
3. Update Inventory (atomic conditional deduction).
4. Update Cart (cleared).
5. Record Idempotency Key.
**External Effects:** Initiate Payment attempt with provider (if synchronous).
**Failure Behavior:** 
- Inventory insufficient: 409 Conflict. Transaction rolled back. Order not created.
- Idempotency conflict: Return previous identical response or 409 Conflict if inputs differ.
**Observable Evidence:** 
- Order entity returned with `PENDING` status.
- Inventory `available_quantity` accurately reflects reservation.
- Database contains historical snapshots for the order.

## 4. Payment Processing: Webhook Handling

**Input:** Webhook payload (Event ID, Payment Status, Order ID, Signature).
**Validation:** Cryptographic signature matches payment provider secret.
**Business Rules:**
- Event ID must not have been previously processed (Deduplication).
- Order must exist.
- Transition from current order state to new state must be valid.
**State Change:** Payment marked `SUCCEEDED` or `FAILED`. Order transitions (e.g., `PENDING` -> `PAID`).
**Persistence (Atomic Transaction):** Insert Event ID (unique constraint). Update Order status. Append to Order Status History.
**External Effects:** Trigger notification (email/SMS) to customer.
**Failure Behavior:** 
- Invalid signature: 401 Unauthorized.
- Duplicate event: 200 OK (idempotent success, no state change).
- DB error: 500 Internal Server Error (let provider retry).
**Observable Evidence:** Order status is updated, notification is dispatched, and webhook provider logs a 200 OK success.
