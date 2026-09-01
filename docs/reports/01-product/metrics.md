# Success Metrics & Non-Functional Requirements

## 1. Performance Metrics
Target baselines will be defined after the initial production deployment. The system will be instrumented to measure the following key performance indicators:

- **P50 Latency:** Median response time for API endpoints.
- **P95 Latency:** 95th percentile response time, indicating behavior for slower requests.
- **P99 Latency:** 99th percentile response time, critical for understanding tail latency and worst-case user experiences.
- **Throughput:** Requests per second (RPS) the system can handle under varying loads.
- **Database Latency:** Time taken to execute queries against PostgreSQL.
- **Slow Queries:** Tracking and analyzing queries that exceed predefined execution time thresholds.

## 2. Reliability & Availability
- **Error Rate:** Percentage of failed requests (HTTP 5xx responses) out of total requests.
- **Graceful Degradation:** The application must fail gracefully when non-critical dependencies (e.g., Redis caching, external review services) are unavailable. Redis must not become a single point of failure for core financial and inventory operations.

## 3. Success Criteria
The project will be considered successful if the following conditions are met:
- The system correctly handles concurrent duplicate requests (e.g., via idempotency keys) without producing duplicate orders.
- The system correctly manages concurrent checkout attempts for a single remaining inventory item without overselling.
- Simulated payment timeouts do not incorrectly transition valid payments into failed states without a reconciliation path.
- E2E tests covering the complete critical journey (`Register -> Login -> Browse -> Add to Cart -> Checkout -> Payment -> Order Tracking`) pass consistently.
- All endpoints are protected by appropriate authorization checks based on roles and resource ownership.
