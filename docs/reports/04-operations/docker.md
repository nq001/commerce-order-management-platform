# Local Production Parity: Docker Setup

## Overview
To eliminate "it works on my machine" issues, we have containerized the Qubrax environment. A developer can now spin up the API, PostgreSQL, and Redis with a single command.

## Architecture

### 1. Dockerfile
We utilize a **multi-stage build**:
- **Stage 1 (Development)**: Includes all `devDependencies`. This is the target used for local `docker-compose` development. It allows us to execute `ts-node`-based TypeORM migrations automatically.
- **Stage 2 & 3 (Production)**: In the future, for Phase 18, we will build the app and strip out all `devDependencies` (`npm ci --omit=dev`), creating a slim, secure production image that only contains the compiled `dist/` JS.

### 2. Docker Compose
The `docker-compose.yml` orchestrates three services:
- **`postgres`**: A `postgres:16-alpine` database.
- **`redis`**: A `redis:7-alpine` instance.
- **`api`**: The NestJS application. It targets the `development` stage of the Dockerfile.

## Startup & Migration Strategy
The `api` container explicitly depends on the healthchecks of the database and Redis (`condition: service_healthy`). This ensures the API does not start before the database is ready to accept connections.

The startup command for the API is:
```bash
sh -c "npm run migration:run && npm run start:dev"
```
This guarantees that **migrations run automatically** on startup. If a new developer clones the repo and runs `docker-compose up`, the database schema will be constructed on the fly.

## Volume Persistence
We use Docker named volumes (`postgres_data` and `redis_data`) to ensure that data survives container restarts. To wipe your database locally, you simply run `docker-compose down -v`.

## How to Run
```bash
# Start all services in the background, rebuilding the API image if needed
docker-compose up --build -d

# View API logs (including migration output)
docker-compose logs -f api

# Stop and wipe database
docker-compose down -v
```
