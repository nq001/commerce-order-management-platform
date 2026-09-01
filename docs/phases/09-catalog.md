# Phase 09 — Catalog

## Objective

Build a complete product/category subsystem usable by customers and staff/admin.

## End-to-End Work

Implement:

- Categories
- Products
- Product lifecycle
- Product SKU uniqueness
- Search
- Filtering
- Pagination
- Sorting
- Product detail
- Admin/staff permissions
- Customer read access
- Validation
- Caching only where justified

## Correctness

- Inactive/unavailable products behave consistently.
- Unauthorized product mutation is impossible.
- Product data is validated.
- Pagination is deterministic.

## Performance

Measure:

- Main catalog query latency
- Search/filter query performance
- Cache hit/miss if caching is introduced

## Exit Criteria

A customer can browse the catalog through the API, while authorized staff/admin can safely manage it.

## Evidence

API tests + performance baseline + Swagger.
