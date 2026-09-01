# Failure Modes and Mitigation

## Overview

The Commerce Order Management Platform is designed with the assumption that systems will fail. This document outlines the critical failure modes within the checkout workflow and how the system mitigates them.

## 1. The "Double-Click" Checkout (Concurrent Duplicate Requests)
**Scenario:** A user clicks the "Checkout" button multiple times in rapid succession, sending overlapping HTTP requests.
**Mitigation:** 
- The client generates an `idempotency_key`. 
- The first request inserts an "in-progress" record into the database. 
- The second request attempts to read or insert the same key, sees the "in-progress" state, and is rejected with a `409 ConflictException` ("Request with this idempotency key is already in progress"). 

## 2. The Retried Request (Network Timeout)
**Scenario:** The server successfully processes the checkout, but the HTTP response is lost due to a network drop. The client retries the request with the same `idempotency_key`.
**Mitigation:**
- The server checks the `idempotency_keys` table, finds the key, and sees the `response_body` is populated.
- It returns the cached `Order` object immediately without re-running the transaction, reserving inventory, or charging the user.

## 3. Two Buyers, One Item (Inventory Race Condition)
**Scenario:** Product X has exactly 1 unit left in stock. User A and User B attempt to check out simultaneously.
**Mitigation:**
- The `InventoryService` is responsible for atomic reservations. 
- It uses database-level concurrency controls (optimistic locking or atomic `UPDATE` with `WHERE available_quantity >= required`) to decrement stock safely.
- One user succeeds; the other receives a `409 ConflictException` (InsufficientStockException). The failed request does not proceed to order creation.

## 4. Database Failure During Order Creation
**Scenario:** Inventory is successfully reserved, but the database crashes or throws a constraint violation while inserting `OrderItem`s.
**Mitigation:**
- The `dataSource.transaction` automatically rolls back, ensuring no partial order data (e.g., an order without items) is saved.
- The `catch` block catches the exception and executes a compensating transaction: `await this.inventoryService.releaseInventory(orderId)`. The reserved stock is returned to the pool.
- The in-progress idempotency key is deleted, allowing the user to retry the checkout cleanly once the system recovers.

## 5. Price or Product Changes Post-Checkout
**Scenario:** A user buys a product for $100. Tomorrow, the admin raises the price to $150 and renames the product.
**Mitigation:**
- The order relies on **Immutable Snapshots**. 
- During the transaction, the `unit_price`, `sku`, and `product_name` are copied into the `OrderItem` table. The order history will always reflect the $100 price, preventing financial and historical corruption.

## 6. Empty Cart Checkout Attempt
**Scenario:** A user attempts to hit the checkout endpoint with an empty cart.
**Mitigation:**
- The service explicitly checks for cart items before acquiring any locks or idempotency records. It returns a `400 BadRequestException` ("Cart is empty"), failing fast.
