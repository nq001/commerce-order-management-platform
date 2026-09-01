# Qubrax Architecture

## 1. Modular Monolith

Qubrax is designed as a **Modular Monolith**. It runs as a single deployable artifact (NestJS server) connected to a single primary database (PostgreSQL), but its internal structure enforces strict logical boundaries between domains.

```mermaid
graph TD
    Client[Client (Web/Mobile/Admin)] --> API[NestJS API Gateway]
    
    subgraph "Modular Monolith (Qubrax)"
        API --> Auth[Auth Module]
        API --> Users[Users Module]
        API --> Catalog[Catalog Module]
        API --> Cart[Cart Module]
        API --> Orders[Orders Module]
        API --> Inventory[Inventory Module]
        API --> Payments[Payments Module]
        
        Orders --> Cart
        Orders --> Inventory
        Orders --> Payments
    end
    
    Auth --> DB[(PostgreSQL)]
    Users --> DB
    Catalog --> DB
    Cart --> DB
    Orders --> DB
    Inventory --> DB
    Payments --> DB
    
    Catalog -.-> Redis[(Redis Cache)]
    API -.-> Redis
    
    Payments --> ExtPayment[External Payment Provider]
```

## 2. Module Boundaries & Communication

- **Controllers:** Handle HTTP routing, payload validation (DTOs), and authentication guards. They delegate immediately to Services.
- **Domain Services:** Hold the core business logic.
- **Inter-Module Communication:** Modules communicate by injecting exported Domain Services of other modules (e.g., `OrdersService` injects `InventoryService`). They do **not** query other modules' database tables directly.
- **Data Access:** Handled exclusively by TypeORM Repositories encapsulated within the owning module.

## 3. Transaction Boundaries

- Operations confined to a single module (e.g., creating a user) use standard isolated database commits.
- **Cross-Module Mutations** (e.g., Checkout spanning Cart, Orders, and Inventory) MUST be wrapped in a single database transaction. The coordinator (e.g., `CheckoutService`) is responsible for instantiating the transaction runner and passing it to the participating sub-services.

## 4. Asynchronous Processing

- **Webhooks:** Payment webhooks arrive synchronously but trigger state changes that may emit asynchronous internal events (e.g., `OrderPaidEvent`).
- **Notifications:** Emails, SMS, and Audit Logs are processed asynchronously via an internal Event Emitter or background queue so they do not block critical path API responses.
