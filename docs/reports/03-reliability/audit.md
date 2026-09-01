# Audit Logging Reliability

## Immutable Ledger
The `audit_logs` table acts as an append-only ledger for sensitive system operations. It guarantees that we have a historical record of "who did what, and when."

## Explicit vs Implicit Logging
We chose to implement Audit Logging via explicit service calls (`AuditService.logAction`) and domain events rather than a global HTTP Interceptor. 

**Why?**
1. **Accuracy**: An HTTP interceptor only knows about the raw JSON payload submitted by the user. It does not know the final database state or what the service layer calculated (e.g. calculated discounts). Explicit logging captures the true domain state change.
2. **Internal Actions**: Background cron jobs, event listeners, and automated state transitions do not pass through HTTP interceptors. Explicit logging ensures these actions are still audited.

## Database Schema Constraints
The `audit_logs` table does not contain foreign key constraints to the entities it audits (e.g., `user_id` or `entity_id` are not strictly enforced foreign keys). 
This ensures the audit log remains intact even if a product or user is hard-deleted from the database in the future (e.g., due to GDPR compliance).
