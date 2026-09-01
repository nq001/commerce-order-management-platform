# Edge Cases & Failure Behaviors

Qubrax is designed around strict reliability. The following edge cases dictate how the system must behave during failure scenarios.

## 1. Duplicate Checkout Request
**Scenario:** A user double-clicks the "Checkout" button, sending two identical HTTP requests concurrently.
**Required Behavior:** 
- The client must include an `Idempotency-Key` header.
- The server acquires a lock or checks a unique constraint on `idempotency_keys(user_id, key)`.
- The first request processes normally.
- The second request encounters the constraint/lock and immediately returns the exact same response as the first, without executing any database mutations or payment calls. Duplicate orders must not be created.

## 2. Competing Inventory (Two buyers, one item)
**Scenario:** `Stock = 1`. User A and User B both view the product and attempt checkout at the exact same millisecond.
**Required Behavior:**
- The inventory deduction must use atomic updates (e.g., `UPDATE inventories SET available_quantity = available_quantity - 1 WHERE id = X AND available_quantity >= 1`).
- The database enforces the `stock >= 0` check constraint.
- User A's transaction commits successfully.
- User B's transaction fails the condition/constraint, rolls back entirely, and User B receives a `409 Conflict` (Product out of stock) error. The system must not oversell.

## 3. Payment Provider Timeout
**Scenario:** The API sends a charge request to the payment provider. The provider processes it successfully, but the network drops the response to the API (timeout).
**Required Behavior:**
- The API must NOT assume the payment failed. It must not transition the order to `FAILED` or `CANCELLED`.
- The order remains in a `PENDING` or `PAYMENT_UNCERTAIN` state.
- The system must rely on asynchronous webhooks from the provider to eventually reconcile the state to `PAID`, OR implement an active background polling job to check the provider for the status of the timed-out transaction.

## 4. API Crash Post-Payment
**Scenario:** The API successfully charges the customer but crashes before it can commit the final order status (`PAID`) to PostgreSQL.
**Required Behavior:**
- Similar to the timeout scenario, the system must support reconciliation. 
- The provider's webhook will eventually arrive (or be re-delivered if the API was down). The webhook handler will safely update the order to `PAID`.

## 5. Duplicate Payment Webhook
**Scenario:** The payment provider's retry logic fires the `payment.succeeded` event three times for the same transaction.
**Required Behavior:**
- The webhook handler uses the provider's unique event ID.
- The `payment_events` table enforces a unique constraint on `provider_event_id`.
- Attempt 1 inserts the event and updates the order.
- Attempts 2 and 3 fail the unique constraint, are caught, and the API returns `200 OK` to the provider to acknowledge receipt, taking no further action.

## 6. Redis Unavailable
**Scenario:** The Redis cluster goes down.
**Required Behavior:**
- Rate limiting may fail open or closed (depending on configuration), but core checkout flow must survive.
- Product catalog reads will miss the cache and fall back directly to PostgreSQL.
- Idempotency must be backed by PostgreSQL, so duplicate checkouts are still prevented. Financial correctness is maintained.

## 7. Unauthorized Resource Access
**Scenario:** Authenticated Customer A attempts to fetch `/orders/{Customer_B_Order_ID}`.
**Required Behavior:**
- The authorization guard detects a mismatch between `authenticated_user.id` and `order.customer_id`.
- The system returns `403 Forbidden` or `404 Not Found` (to avoid leaking the existence of B's order).

## 8. Partial Database Failure
**Scenario:** During checkout, the order row is inserted, but the connection drops before inventory is updated.
**Required Behavior:**
- All checkout mutations must be wrapped in a single PostgreSQL `TRANSACTION`.
- The connection drop causes PostgreSQL to roll back the entire transaction automatically. No orphaned orders or mismatched inventory will exist.
