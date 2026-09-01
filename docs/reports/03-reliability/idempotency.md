# Idempotency Strategy

## Overview

In distributed systems and e-commerce platforms, network requests can fail unpredictably. A customer might click "Checkout" twice, or their mobile network might drop just as the server responds with a success message, prompting the app to retry the request. 

To safely handle retries without creating duplicate orders or double-charging the customer, the checkout workflow implements strict **Idempotency**.

## How It Works

We require the client to generate a unique `idempotency_key` (typically a UUID) and send it with the checkout request. 

The checkout process follows this lifecycle:

1. **Check for Existing Key:** 
   Upon receiving a checkout request, the server queries the `idempotency_keys` table for the specific `user_id` and `key`.
2. **Handle In-Progress Requests:** 
   If the key exists but has no `response_body`, it means the original request is still processing. The server throws a `ConflictException` to prevent concurrent execution (handling the "double-click" scenario).
3. **Handle Completed Requests:**
   If the key exists and contains a `response_body`, the server immediately returns the cached response. The order is not recreated, and no inventory is deducted again.
4. **Register New Key:**
   If the key is new, the server registers an "in-progress" record in the database.
5. **Execute Workflow:**
   The server proceeds with inventory reservation and the database transaction for order creation.
6. **Save Response:**
   Upon successful commit, the final `Order` object is saved to the `response_body` of the idempotency record.
7. **Failure Recovery:**
   If the checkout fails (e.g., insufficient inventory, database error), the "in-progress" idempotency record is hard-deleted in the `catch` block. This allows the client to safely retry the operation with the same key once the underlying issue is resolved.

## Database Schema

```sql
CREATE TABLE idempotency_keys (
  user_id UUID NOT NULL,
  key VARCHAR(255) NOT NULL,
  request_path VARCHAR(255) NOT NULL,
  response_body JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, key)
);
```

## Guarantees

- **Exactly-once execution:** A single idempotency key guarantees that the core business logic (inventory deduction, cart clearing, order creation) executes exactly once, no matter how many times the client retries the request.
- **Race condition prevention:** Because the `idempotency_keys` record is inserted before the heavy lifting begins, race conditions from simultaneous duplicate requests are blocked at the database level via unique constraints.
