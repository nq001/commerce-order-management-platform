# Scope & Target Users

## 1. Target Users & Capabilities

### 1.1 Customer
- Register, Login, Refresh session, Logout
- Manage profile and addresses
- Browse, search, and view product details
- Manage cart and apply coupons
- Checkout and Pay
- View orders, track shipment, and cancel eligible orders
- Create reviews

### 1.2 Admin
- Manage products, categories, and inventory
- Manage orders
- Manage users, roles, and coupons
- View reports and audit logs

### 1.3 Staff
- Access is strictly permission-based (e.g., `inventory.read`, `inventory.update`, `orders.read`, `shipping.update`).
- Staff do not automatically receive administrative privileges.

## 2. Primary User Journeys

### The Critical Customer Journey
`Register → Login → Browse Products → Add to Cart → Apply Coupon → Checkout → Create Order → Payment → Inventory Reservation/Deduction → Shipping → Delivery → Review`

## 3. Functional Scope (v1)

### Authentication & Users
- JWT-based authentication (access/refresh tokens).
- Profile and address management.

### Roles & Permissions
- RBAC (Role-Based Access Control) to protect endpoints and enforce resource ownership.

### Catalog & Inventory
- Products and Categories management with search/filter/pagination.
- Strict inventory tracking, adjustments, reservations, and deductions preventing negative stock.

### Cart, Orders & Payments
- Cart validation.
- Order creation through checkout with state transition validation and historical snapshots.
- Payment attempts, provider webhook handling (with deduplication), and status tracking.

### Shipping & Coupons
- Shipment creation and tracking.
- Coupon creation, expiration, usage limits, and eligibility checks.

### Supporting Services
- Abstracted delivery mechanism for Notifications (Order, Payment, Shipping).
- Reviews with optional verified-purchase rules.
- Audit logs for sensitive operations.
- Operational health checks.

## 4. Non-Goals (Out of Scope for v1)
The first version does not attempt to build:
- A full frontend UI.
- A real warehouse management system.
- A full accounting platform.
- A product recommendation engine.
- A multi-region distributed architecture.
- Microservices (the architecture is strictly a Modular Monolith).

## 5. Assumptions and Constraints
- PostgreSQL is the primary datastore for all relational and transactional data.
- Redis will only be used where it solves a specific problem (caching, rate limiting) and its failure must not compromise critical data.
- The system must enforce strong boundaries between domains (e.g., Controllers must not bypass domain services).

## 6. Initial Risk Register
- **Duplicate Checkout:** High risk. Must be mitigated using idempotency keys.
- **Inventory Overselling:** High risk. Competing checkout requests must be safely managed using concurrency control.
- **Webhook Replays:** Medium risk. Payment providers may send duplicate webhooks. A unique constraint on event IDs must be used.
- **Payment Timeouts:** High risk. A timeout when calling a payment provider does not mean the payment failed. A reconciliation strategy or pending state is required.
