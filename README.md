# Qubrax Commerce Platform

Qubrax is a modern, reliable, and production-ready E-commerce Order Management backend. It is built as a **Modular Monolith** using NestJS, PostgreSQL, and Redis. It handles the entire customer journey from catalog browsing and cart management to secure checkouts, payment processing, and inventory concurrency control.

## Architecture & Tech Stack
- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL 16 (via TypeORM)
- **Cache & Queues**: Redis 7
- **Auth**: JWT (Access & Refresh tokens) with Role-Based Access Control
- **Containerization**: Docker & Docker Compose
- **Observability**: Pino (Structured JSON logging)

## Deep-Dive Documentation
For detailed engineering decisions and system design, please see the `/docs` directory:
- [Technical Case Study](docs/reports/06-final/case-study.md) - The engineering journey of Qubrax.
- [Database ERD & Schema](docs/phases/05-database.md)
- [API Contract & Swagger](docs/phases/06-api-contract.md)
- [Testing Strategy](docs/reports/05-testing/testing-strategy.md)
- [Production Deployment](docs/reports/04-operations/deployment.md)

## Quick Start (Local Parity)

We use Docker to ensure "it works on my machine" is a guarantee, not a hope.

1. **Clone the repository.**
2. **Start the Infrastructure**:
   ```bash
   # This will spin up Postgres, Redis, and the NestJS API.
   # It will automatically run database migrations on startup.
   docker-compose up --build -d
   ```
3. **Verify Health**:
   Navigate to `http://localhost:3000/api/health`.
4. **View Swagger API Docs**:
   Navigate to `http://localhost:3000/api/docs`.

## Running Tests
Qubrax enforces a strict testing diamond (Unit -> Integration -> E2E Failure Modes).

```bash
# Install dependencies locally first
npm ci

# Run fast, isolated Unit Tests
npm run test

# Run E2E and Database Integration Tests
# (Requires the local database from docker-compose to be running)
npm run test:e2e
```

## License
MIT Licensed. Built by the Qubrax Engineering Team.
