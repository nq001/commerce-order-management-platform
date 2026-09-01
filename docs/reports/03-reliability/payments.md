# Payment Reliability Strategy

## Overview
External payment providers (e.g. Stripe, PayPal) communicate state changes asynchronously via webhooks. Webhooks are notorious for being unreliable:
- They can be sent multiple times for the same event.
- They can be delayed.
- They can arrive out of order.

Our system is designed to treat all incoming payment webhooks with suspicion, enforcing strict idempotency and state machine validation.

## Webhook Deduplication
Every incoming webhook must have a unique identifier (`provider_event_id`). 

When a webhook is received, the system attempts to insert a record into the `payment_events` table:
```sql
CREATE TABLE payment_events (
  id UUID PRIMARY KEY,
  provider_event_id VARCHAR(255) UNIQUE NOT NULL,
  order_id UUID NOT NULL,
  provider_status VARCHAR(255) NOT NULL,
  internal_status VARCHAR(255) NOT NULL,
  amount INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Because `provider_event_id` has a `UNIQUE` constraint, if a duplicate webhook arrives simultaneously, the database will throw a constraint violation (`23505` in Postgres). 

**The critical rule:** If we catch a duplicate violation, we **do not throw an error to the provider**. We log a warning and return `200 OK`. Returning an error would cause the provider to keep retrying, creating unnecessary load.

## State Machine Validation
An order can only transition to `PAID` if its current status is `PENDING_PAYMENT`.
If a `payment.succeeded` webhook arrives but the order is already `PAID` or `CANCELLED`, the webhook is logged and safely ignored.

This state transition, along with marking the `payment_event` as `PROCESSED`, happens inside a single database transaction. 

## Event-Driven Decoupling
Once a payment succeeds, the system must trigger downstream effects (like creating a pending Shipment). 

Rather than the `PaymentsService` directly calling the `ShippingService` (which creates tight coupling), the `PaymentsService` fires an in-memory event (`order.paid`). The `ShippingService` listens to this event to initialize the shipment workflow. 

This preserves the modular monolith boundary and ensures that if shipping logic changes, payment logic does not need to be touched.
