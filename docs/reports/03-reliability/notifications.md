# Notification Delivery Strategy (Outbox Pattern)

## The Problem with Async Processing
Sending emails or SMS messages synchronously during an HTTP request is dangerous:
- The external provider (e.g. SendGrid, Twilio) might timeout, causing our database transaction to fail or hang.
- The external provider might fail completely. 

However, firing an async event (e.g., `setTimeout` or an in-memory event listener) without database persistence is equally dangerous: if the Node.js process crashes before the email is sent, the notification is lost forever.

## The Outbox Pattern Solution
To ensure reliable delivery without introducing the operational complexity of a full message broker (like RabbitMQ or Redis Bull), we use the **Outbox Pattern**.

1. **Transactional Sync**: When an order is paid (or shipment dispatched), the system creates a `Notification` record in the database with `status = 'PENDING'` synchronously.
2. **Cron Polling**: A lightweight Cron job (`@Cron(CronExpression.EVERY_MINUTE)`) polls the database for `PENDING` notifications.
3. **Delivery Attempt**: The cron job attempts to send the notification via the external provider.
4. **State Update**:
   - On success, the database record is updated to `DELIVERED`.
   - On failure, it is updated to `FAILED` with the `error_message` stored for debugging or manual retry.

This guarantees that no notification is ever "lost in memory." If the server crashes, the Cron job will simply pick up the `PENDING` notifications upon restart.
