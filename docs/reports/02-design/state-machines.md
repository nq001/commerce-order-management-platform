# State Machines

The following Mermaid diagrams define the strict state transitions allowed for core entities in Qubrax. The application layer must reject any transition not explicitly modeled here.

## 1. Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING : Checkout Created
    PENDING --> CONFIRMED : Payment Authorized
    PENDING --> PAYMENT_FAILED : Payment Declined / Timeout
    PENDING --> CANCELLED : Customer/Admin Cancel
    
    CONFIRMED --> PAID : Payment Captured
    CONFIRMED --> CANCELLED : Admin Cancel (Requires Refund)
    
    PAID --> PROCESSING : Sent to Fulfillment
    PAID --> REFUNDED : Admin Refund
    
    PROCESSING --> SHIPPED : Carrier Picked Up
    PROCESSING --> REFUNDED : Exception/Refund
    
    SHIPPED --> DELIVERED : Carrier Confirmation
    SHIPPED --> RETURNED : Customer Return
    
    DELIVERED --> RETURNED : Customer Return
    
    PAYMENT_FAILED --> [*]
    CANCELLED --> [*]
    REFUNDED --> [*]
    DELIVERED --> [*]
    RETURNED --> [*]
```

## 2. Payment Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING : Payment Intent Created
    PENDING --> AUTHORIZED : Provider Webhook (Auth)
    PENDING --> FAILED : Provider Webhook (Fail)
    
    AUTHORIZED --> SUCCEEDED : Provider Webhook (Capture)
    AUTHORIZED --> FAILED : Capture Failed
    
    SUCCEEDED --> REFUNDED : Admin Action
    
    FAILED --> [*]
    REFUNDED --> [*]
```

## 3. Inventory Reservation Lifecycle

Inventory is managed via strict mathematical deduction rather than discrete states, but conceptually it follows this flow:

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE : Stock Added
    AVAILABLE --> RESERVED : Checkout Atomic Transaction
    RESERVED --> DEDUCTED : Payment Succeeded
    RESERVED --> AVAILABLE : Payment Failed / Order Cancelled
```
*Implementation Note:* In PostgreSQL, this is often implemented atomically by updating the `available_quantity` during checkout, and logging an `inventory_movement` row to track the logical reservation vs final deduction.
