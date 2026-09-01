# Technical Case Study: Qubrax Commerce Platform

## 1. Problem Statement
The goal of this project was to construct Qubrax: a resilient, scalable, and highly reliable e-commerce backend. The primary challenges in commerce backends revolve around state management, race conditions (overselling inventory), external unreliability (payment gateways timing out), and ensuring absolute data consistency across domains.

## 2. Architecture & Design Decisions
We chose a **Modular Monolith** architecture using **NestJS**.
- **Why not Microservices?** A microservice architecture introduces distributed transaction complexity (Sagas, Two-Phase Commits) prematurely. By utilizing strict module boundaries within a single Node.js runtime, we maintained high developer velocity while preserving the ability to extract modules (like `Payments` or `Inventory`) into distinct microservices later if scaling necessitates it.
- **Why PostgreSQL?** Commerce requires strict ACID compliance. The relational integrity of Postgres guarantees that orders, payments, and inventory remain intrinsically linked without eventual consistency anomalies.

## 3. Difficult Engineering Challenges

### Concurrency & Overselling
**Problem**: If an item has a stock quantity of 1, and two users attempt to check out at the exact same millisecond, a naive `UPDATE inventory SET qty = qty - 1` might succeed for both, resulting in an oversold item and an angry customer.
**Solution**: We implemented **Optimistic Locking** using TypeORM's `@VersionColumn()`. When a user initiates a checkout, the application reads the inventory version. When it attempts to deduct the stock, it includes the version in the `WHERE` clause. If another transaction modified the row first, the version increments, and the second transaction safely throws a `ConcurrencyException`, rolling back the checkout safely.

### Payment Failures & Ghost Orders
**Problem**: Calling an external payment gateway (like Stripe) is inherently unreliable. The network can drop, or the provider can time out.
**Solution**: We separated the checkout process into two distinct, idempotent phases.
1. We lock the inventory and create an `Order` in a `PENDING` state.
2. We dispatch a background event via `@nestjs/event-emitter` to process the payment.
If the payment succeeds, the order shifts to `PAID`. If it fails or times out, it shifts to `PAYMENT_FAILED`, and a compensating transaction restores the inventory stock.

## 4. Production Rollout & Observability
"It works on my machine" is unacceptable. We containerized the entire application using a **Multi-Stage Dockerfile**. The `development` stage is used locally alongside `docker-compose` to run tests and automatic migrations, while the `production` stage strips all development dependencies for a slim, secure footprint.

For observability, we implemented **Structured JSON Logging** (`nest-pino`). Every HTTP request is tagged with a unique `req.id` that cascades down into the service layers, allowing us to trace a user's exact path and pinpoint errors instantly. 

## 5. Lessons Learned & Future Scale
- **Event-Driven Coupling**: Using `@nestjs/event-emitter` was highly effective for decoupling modules (e.g., the Order module just emits `order.created`, and the Notification module reacts to it). However, at a larger scale, an in-memory event bus poses data-loss risks if the server crashes before processing the event.
- **Future Improvement**: At higher scale, we would swap the in-memory event emitter for an external message broker (like RabbitMQ or Kafka) to ensure durable, at-least-once delivery of internal events.
