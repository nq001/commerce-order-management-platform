# CI/CD and DevOps Strategy

## Overview
To ensure repeatable delivery and protect the production environment from regressions, we have implemented a comprehensive CI/CD strategy using GitHub Actions. This document outlines our branching, environments, and deployment strategies.

## Branching Strategy
We follow **Trunk-Based Development**:
- `main` is the single source of truth and represents the current state of production.
- Developers create short-lived feature branches (`feature/xyz`, `bugfix/abc`) from `main`.
- All code enters `main` via Pull Requests.
- PRs cannot be merged until all CI quality gates pass.

## Quality Gates (The Pipeline)
Our GitHub Actions pipeline (`.github/workflows/ci.yml`) executes three primary jobs:

### 1. Quality Gates (Lint & Unit Tests)
- **Environment**: Node 22
- **Actions**: Installs dependencies, runs ESLint, and executes all isolated unit tests (`*.spec.ts`).
- **Goal**: Catch syntax errors and logical flaws in pure services quickly.

### 2. Integration & E2E Tests
- **Environment**: Node 22 with PostgreSQL 16 and Redis 7 service containers.
- **Actions**: Automatically runs TypeORM migrations to build the schema, then executes the full E2E test suite (`npm run test:e2e`).
- **Goal**: Validate database constraints, transaction boundaries, and external provider mock interactions.

### 3. Build Docker Image
- **Environment**: Docker Buildx
- **Actions**: If the tests pass and the code is on `main`, the CI system executes a multi-stage Docker build, targeting the `production` stage.
- **Goal**: Create a lightweight, secure container image containing only the compiled `dist/` directory and production dependencies.

## Environment Strategy
1. **Development**: Ephemeral environments on developer machines using `docker-compose up`.
2. **Staging**: An exact replica of production. When code merges to `main`, the built Docker image is deployed here for final QA.
3. **Production**: A tagged release (e.g., `v1.0.0`) triggers the deployment of the exact same immutable Docker image that was tested in Staging.

## Secrets Handling
No secrets are committed to the repository. The CI pipeline uses mock secrets injected via GitHub Actions environment variables for testing. Production secrets will be managed by a secure vault (e.g., AWS Secrets Manager or Kubernetes Secrets) and injected into the container at runtime.

## Database Migration & Rollback Strategy
- **Forward-Only**: We never use `migration:revert`. All database changes must be forward-compatible. If a column needs deleting, it is deprecated in code first, and dropped in a subsequent release.
- **Rollbacks**: If a deployment introduces a critical bug, we roll back to the previous Docker image tag. Because migrations are forward-compatible, the older code can still operate safely on the newer database schema.
