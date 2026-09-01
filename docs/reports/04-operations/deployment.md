# Production Deployment Runbook

## Overview
This runbook details the procedures for provisioning, deploying, and managing Qubrax in a production environment using Docker Compose and Caddy.

## Infrastructure Provisioning
1. **Server Setup**: Provision a Linux VPS (e.g., Ubuntu 24.04).
2. **Dependencies**: Install Docker and Docker Compose Plugin.
3. **DNS**: Point your production domain's A-record to the server's public IP address.

## Secure Secrets Configuration
Never commit production secrets to Git. Create an `.env.prod` file on the server:
```env
# Example .env.prod
DATABASE_URL=postgres://postgres:SECURE_PASSWORD@db:5432/commerce_prod
REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=PRODUCTION_SECURE_ACCESS_SECRET
JWT_REFRESH_SECRET=PRODUCTION_SECURE_REFRESH_SECRET
PORT=3000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SECURE_PASSWORD
POSTGRES_DB=commerce_prod
```
Change permissions: `chmod 600 .env.prod`

## Initial Deployment
1. Transfer `docker-compose.prod.yml` and `scripts/deploy.sh` to the server.
2. Edit `docker-compose.prod.yml` and replace `example.com` with your actual domain.
3. Run the initial deployment script: `bash deploy.sh`.
   - *This will pull the image, run migrations, and start Caddy, the API, PostgreSQL, and Redis.*
   - *Caddy will automatically provision a free Let's Encrypt TLS certificate for your domain.*

## Health & Verification
- **API Health**: Navigate to `https://example.com/api/health` to verify the API is responding.
- **Swagger Docs**: Navigate to `https://example.com/api/docs`.
- **Logs**: Run `docker-compose -f docker-compose.prod.yml logs -f api` to tail the API logs.
