# Observability Strategy

## Overview
To operate Qubrax safely in production, we require deep visibility into its runtime behavior. Our observability stack relies on structured logging, request tracing, and automated health checks.

## Structured Logging
We use `nest-pino` to enforce structured JSON logging.
- **Request IDs**: Every incoming HTTP request is assigned a unique `req.id`. This ID is automatically appended to every log emitted during the lifecycle of that request, allowing us to trace a user's journey through our service layers.
- **Response Times**: `pino-http` automatically measures and logs the `responseTime` of every request, which is vital for monitoring endpoint latency.

## Metrics & Health Checks
- **Probes**: Our Kubernetes/Docker orchestrators rely on the `/api/health` endpoint. This endpoint verifies the database connection and Redis connection. If either fails, the API container is marked as unhealthy and will be automatically restarted or removed from the load balancer pool.
- **Business Metrics**: We log explicit events (e.g., `ORDER_CREATED`, `PAYMENT_FAILED`) that can be parsed by our log aggregation tool (like Datadog or ELK) to create real-time dashboards of business health.

## Alerts
We configure alerts in our downstream log aggregator based on the following triggers:
- **High Error Rate**: 5xx errors > 1% over 5 minutes.
- **Payment Gateway Timeouts**: More than 3 timeouts in 15 minutes.
- **Elevated Latency**: P99 latency on the `/catalog/products` endpoint exceeds 500ms.
