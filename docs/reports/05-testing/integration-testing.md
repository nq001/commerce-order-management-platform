# Integration Testing Strategy

## Validating the Database Layer
Unit testing repositories with mocks is an anti-pattern because it tests the mock, not the database constraint. Our integration tests use a real PostgreSQL instance (via TypeORM) to test the following:

### 1. Unique Constraints
We verify that the database correctly enforces rules like "one provider event ID per payment". If our webhook deduping logic fails, the database constraint is the final safety net. Our integration tests (`database-constraints.e2e-spec.ts`) intentionally insert duplicate rows to ensure the database throws a `23505` unique violation.

### 2. Transaction Rollbacks
We verify that if an error is thrown midway through a complex operation (like a webhook transition or a checkout), all partial writes are rolled back. We test this by intentionally throwing errors inside `dataSource.transaction()` blocks and querying the database afterward to ensure no partial state leaked.

### 3. Module Boundaries
We verify that when `PaymentsModule` saves a state and fires an `order.paid` event, the `ShippingModule` asynchronously picks it up and successfully writes its own entities.
