# Domain Model

This document defines the core aggregates and domain boundaries for Qubrax. 

## 1. User Aggregate
**Responsibility:** Manages identity, authentication credentials, and basic profile information.
**Lifecycle:** Created on registration. Can be suspended or deleted (soft delete).
**Boundaries & Ownership:** Owns Address entities. Does *not* own Orders (Orders reference Users).
**Atomic Operations:** Profile updates.

## 2. Product Aggregate
**Responsibility:** Represents a sellable item in the catalog.
**Lifecycle:** Draft -> Active -> Archived.
**Boundaries & Ownership:** Owns basic product metadata (price, SKU). References Category. Does *not* own Inventory.
**Commands/Actions:** Create, Update Price, Archive.

## 3. Inventory Aggregate
**Responsibility:** Tracks the physical availability of a Product SKU.
**Lifecycle:** Initialized when a Product is created. Updated via movements.
**Boundaries & Ownership:** 1:1 relationship with a Product. Owns Inventory Movements (ledger).
**Atomic Operations:** Deduct stock, add stock, reserve stock. MUST be atomic database operations using conditional updates.

## 4. Cart Aggregate
**Responsibility:** Temporary container for a customer's intended purchases.
**Lifecycle:** Created on first add. Cleared upon successful checkout or manual clear.
**Boundaries & Ownership:** Owns Cart Items. References Products.
**Commands/Actions:** Add Item, Remove Item, Update Quantity, Clear.

## 5. Order Aggregate
**Responsibility:** Immutable record of a financial transaction and fulfillment commitment.
**Lifecycle:** Pending -> Confirmed -> Paid -> Processing -> Shipped -> Delivered.
**Boundaries & Ownership:** Owns Order Items and Address Snapshots. References User, Payment, and Shipment.
**Atomic Operations:** Checkout creation (Order + Items + Snapshots + Inventory Deduction + Cart Clear) MUST be a single atomic transaction.

## 6. Payment Aggregate
**Responsibility:** Tracks financial interactions with external payment providers.
**Lifecycle:** Pending -> Authorized -> Succeeded | Failed | Refunded.
**Boundaries & Ownership:** Owns Payment Events (webhooks). References Order.
**Async Operations:** Webhook processing is asynchronous but requires atomic state transitions internally.

## 7. Shipment Aggregate
**Responsibility:** Tracks the physical delivery of an Order.
**Lifecycle:** Pending -> Dispatched -> In_Transit -> Delivered.
**Boundaries & Ownership:** Owns tracking history. References Order.

## 8. Coupon Aggregate
**Responsibility:** Defines discount rules and usage limits.
**Lifecycle:** Active / Inactive / Expired.
**Boundaries & Ownership:** Owns usage history.
**Atomic Operations:** Incrementing the `times_used` counter must be atomic during checkout to prevent exceeding global limits.

## 9. Notification & Audit (Supporting Domains)
**Responsibility:** Side-effects of core domain changes.
**Atomic vs Async:** Audit logs should ideally be written in the same transaction as the mutative action. Notifications should be published asynchronously via a message broker or background job.
