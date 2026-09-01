# API Conventions

Qubrax exposes a RESTful JSON API. All endpoints are versioned and follow strict conventions to ensure predictability for frontend and external integrators.

## 1. URL Structure
All endpoints are prefixed with `/api/v1`.
Resources are pluralized nouns.
- `GET /api/v1/products`
- `POST /api/v1/orders`

Sub-resources are used where appropriate to indicate hierarchy:
- `GET /api/v1/orders/{orderId}/items`

## 2. HTTP Methods & Status Codes
- `GET`: Retrieve a resource or collection (`200 OK`).
- `POST`: Create a new resource (`201 Created`).
- `PATCH`: Partially update an existing resource (`200 OK`).
- `DELETE`: Soft or hard delete a resource (`204 No Content` or `200 OK`).

Common Error Codes:
- `400 Bad Request`: Validation failure.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Insufficient permissions or resource ownership mismatch.
- `404 Not Found`: Resource does not exist (also used to mask 403s for secure resources).
- `409 Conflict`: Business rule violation (e.g., inventory unavailable, idempotency conflict).
- `500 Internal Server Error`: Unexpected system failure.

## 3. Standard Error Format
Errors MUST NEVER leak stack traces or database internals. The standard error payload is:
```json
{
  "statusCode": 409,
  "code": "INVENTORY_UNAVAILABLE",
  "message": "The requested quantity exceeds available stock.",
  "timestamp": "2026-08-31T07:25:00.000Z",
  "path": "/api/v1/checkout"
}
```

## 4. Pagination & Filtering
For endpoints returning collections, pagination is mandatory.
We use **Offset Pagination** for administrative endpoints (where jumping pages is useful) and **Cursor Pagination** for high-volume customer-facing endpoints (like Orders or Products).

Example Pagination Query:
`GET /api/v1/products?limit=50&cursor=eyJpZCI6MTIzfQ==`

Standard Response Envelope:
```json
{
  "data": [ ... ],
  "meta": {
    "nextCursor": "...",
    "hasMore": true
  }
}
```

## 5. Security & Idempotency
- **Authentication:** `Authorization: Bearer <JWT>` header required for all protected routes.
- **Idempotency:** Any `POST` or `PATCH` request that mutates financial/inventory state (e.g., `/api/v1/checkout`) REQUIRES an `Idempotency-Key` header.
```http
POST /api/v1/checkout
Idempotency-Key: e4b29c91-12c4-4b5a-9f5b-6f1e2f3d4c5b
Authorization: Bearer <JWT>
```
