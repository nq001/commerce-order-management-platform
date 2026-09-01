# Requirements Documentation

## 1. Functional Requirements

### Authentication & Users
- **F-AUTH-01:** System must allow users to register with an email and password.
- **F-AUTH-02:** System must issue JWT access and refresh tokens upon successful login.
- **F-AUTH-03:** System must provide a mechanism to securely revoke refresh tokens (logout).
- **F-USR-01:** Users must be able to view and edit their own profiles and shipping addresses.

### Roles & Permissions
- **F-PERM-01:** System must restrict administrative actions (e.g., product creation) to users with explicit administrative roles.
- **F-PERM-02:** Staff access must be strictly granular based on permissions (e.g., `inventory.update`), avoiding blanket admin grants.

### Catalog
- **F-CAT-01:** Admins must be able to create, update, and archive products and categories.
- **F-CAT-02:** Customers must be able to view, search, filter, and paginate active products.

### Inventory
- **F-INV-01:** System must track current stock levels for each product SKU.
- **F-INV-02:** System must reserve inventory during the checkout process and finalize deduction upon successful payment.
- **F-INV-03:** System must completely reject operations that would result in negative inventory.

### Cart, Orders & Checkout
- **F-CART-01:** System must allow customers to add/remove products, update quantities, and clear their cart.
- **F-ORD-01:** System must support applying valid coupons to a cart/checkout total.
- **F-ORD-02:** System must generate an order entity capturing historical snapshots (price, product name, address) at the exact moment of checkout.
- **F-ORD-03:** Order states must strictly follow the defined state machine transitions (e.g., `PENDING` -> `CONFIRMED` -> `PAID` -> `PROCESSING`).

### Payments & Webhooks
- **F-PAY-01:** System must integrate with external payment providers via an abstraction layer.
- **F-PAY-02:** System must receive and process payment provider webhooks, translating them into internal state changes (e.g., `AUTHORIZATION_SUCCESS`).

## 2. Non-Functional Requirements

### Performance & Scalability
- **NF-PERF-01:** Critical endpoints (e.g., GET Product) should support sub-200ms P95 latency (to be measured post-deployment).
- **NF-SCALE-01:** The modular monolith must be containerized to allow horizontal scaling (multiple instances behind a load balancer).

### Reliability
- **NF-REL-01 (Idempotency):** Mutative API endpoints (e.g., Checkout, Payment Processing) must accept and enforce Idempotency-Keys.
- **NF-REL-02 (Database):** Operations affecting multiple aggregates (e.g., Cart clearing + Order creation + Inventory reservation) must execute within atomic database transactions.

## 3. Security Requirements
- **SEC-01 (Password Security):** Passwords must be hashed using strong, industry-standard algorithms (e.g., bcrypt/Argon2) before persistence.
- **SEC-02 (Mass Assignment):** API requests must strictly validate payloads against defined DTOs (Data Transfer Objects), stripping undefined fields.
- **SEC-03 (Resource Ownership):** Endpoints accessing user data (Orders, Profiles) must explicitly verify the authenticated user matches the resource owner.
- **SEC-04 (Secrets):** No sensitive keys, database credentials, or API tokens may be hardcoded or logged.

## 4. Operational Requirements
- **OP-01 (Containerization):** The application must be fully runnable via Docker (and Docker Compose for local parity).
- **OP-02 (Observability):** The system must expose a `/health` endpoint validating API, DB, and Redis connectivity.
- **OP-03 (Audit Logs):** Changes to critical entities (Roles, Products, Inventory, Orders, Refunds) must generate immutable audit logs.
