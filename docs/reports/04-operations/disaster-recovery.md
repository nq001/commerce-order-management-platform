# Disaster Recovery & Backups

## Backup Strategy
Our primary data store is PostgreSQL. Redis is used for ephemeral queues/caching and does not require strict backups.
- We use a scheduled `cron` job on the host machine to execute `pg_dump` daily.
- Backup files are immediately shipped to offsite cold storage (e.g., AWS S3).

**Automated Backup Script Example:**
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M-%S)
docker exec $(docker ps -q -f name=commerce-db) pg_dump -U postgres -d commerce_prod -F c > /backups/db_$DATE.dump
aws s3 cp /backups/db_$DATE.dump s3://qubrax-backups/
```

## Restore Procedure
In the event of catastrophic failure or data corruption, follow these steps to restore the database from the last known good backup:
1. Stop the API container to prevent new writes: `docker-compose -f docker-compose.prod.yml stop api`
2. Download the backup file from S3: `aws s3 cp s3://qubrax-backups/db_YYYY-MM-DD.dump .`
3. Drop and recreate the database:
   ```bash
   docker exec -it $(docker ps -q -f name=commerce-db) psql -U postgres -c "DROP DATABASE commerce_prod;"
   docker exec -it $(docker ps -q -f name=commerce-db) psql -U postgres -c "CREATE DATABASE commerce_prod;"
   ```
4. Restore the dump file:
   ```bash
   cat db_YYYY-MM-DD.dump | docker exec -i $(docker ps -q -f name=commerce-db) pg_restore -U postgres -d commerce_prod
   ```
5. Restart the API: `docker-compose -f docker-compose.prod.yml start api`

## Application Rollback Strategy
If a newly deployed API image contains a critical bug:
1. Identify the previous stable Docker image tag (e.g., `qubrax/api:v1.0.1`).
2. Update the `docker-compose.prod.yml` to point to the older tag.
3. Run `docker-compose -f docker-compose.prod.yml up -d api`.
*Note: Because our database migrations are strictly forward-only, rolling back the application code will not cause schema mismatch errors.*
