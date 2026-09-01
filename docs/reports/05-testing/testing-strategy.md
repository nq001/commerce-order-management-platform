# Comprehensive Testing Strategy

## Philosophy: Value Over Coverage
Our testing strategy does not aim for an arbitrary 100% line coverage metric. Instead, it prioritizes testing **business behavior, critical paths, and failure modes**. An untested getter method is acceptable; an untested coupon calculation or concurrent checkout is a critical vulnerability.

## The Testing Diamond
We use a "Diamond" testing approach tailored to modular monoliths:
1. **Targeted Unit Tests**: We only unit test pure services and complex logic (e.g., `PricingService`, `CouponsService`). We mock dependencies like Repositories to test logic branches rapidly without database overhead.
2. **Heavy Integration Tests**: We rely heavily on integration tests that hit a real PostgreSQL database to verify constraints, cascading rules, transaction rollbacks, and module boundary events.
3. **E2E Customer Journeys**: We test full HTTP pathways for critical flows (Checkout, Webhook Processing, Cart manipulation) to ensure the framework bindings, guards, and controllers function correctly.
4. **Boundary & Failure Testing**: We explicitly test what happens when dependencies crash, when two requests arrive simultaneously, and when users attempt to cross privilege boundaries.
