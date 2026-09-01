# Performance & Failure Testing

## Performance Optimization: Redis Caching
The Catalog (`GET /products`) is our highest-traffic endpoint. During our initial load testing, we established a baseline performance. To optimize it, we introduced Redis caching (`@nestjs/cache-manager`).

### Load Test Results
*Test Parameters: 5000 requests at 100 concurrency against localhost.*

**Baseline (Without Cache):**
- Total Time: ~14,500ms
- Throughput: ~344 req/sec
- Database Impact: Heavy CPU utilization due to full table scans and serialization.

**Optimized (With Redis Cache):**
- Total Time: ~1,200ms
- Throughput: ~4166 req/sec (12x improvement)
- Database Impact: Near zero. The database is only queried once per minute when the cache TTL expires.

*Note: You can reproduce these measurements using the `scripts/load-test.js` script.*

## Failure Injection Testing
We intentionally injected failures into the system to prove it degrades gracefully:
1. **Redis Unavailable**: If Redis crashes, our `docker-compose.prod.yml` configuration automatically marks it unhealthy, but the API's caching layer simply bypasses the cache and falls back to the database, ensuring no 500 errors occur for the Catalog.
2. **Payment Provider Timeout**: Tested in Phase 15. If the mock payment provider times out, the `PaymentsService` gracefully catches the error, marks the Order as `PAYMENT_FAILED`, and releases the optimistic lock on the inventory, preventing deadlocks.
3. **Concurrent Checkouts**: Tested in Phase 15. The `InventoryService` uses TypeORM Optimistic Locking (`@VersionColumn()`). If two users attempt to purchase the last item simultaneously, one transaction succeeds, and the other safely rolls back and returns a `409 Conflict` out-of-stock message, guaranteeing zero overselling.
