# Initial Glossary

To ensure a shared vocabulary across the engineering team, the following terms are strictly defined for the Qubrax project:

- **Modular Monolith**: An architectural style where the application is deployed as a single unit, but its internal structure is strictly divided into decoupled, cohesive domain modules. This provides strong boundaries without distributed-system complexity.
- **Idempotency**: The property of certain operations where applying them multiple times produces the same result as applying them once. Crucial for safely handling retried requests (e.g., checkout or payment).
- **Idempotency Key**: A unique identifier sent by the client to allow the server to recognize and safely ignore duplicate requests.
- **Concurrency Control**: Mechanisms to manage simultaneous access to shared data.
  - **Pessimistic Locking**: Locking a database row during a transaction to prevent others from reading or modifying it until the transaction completes.
  - **Optimistic Concurrency**: Using a version/revision column to reject updates if the data was modified by someone else since it was read.
- **Order Snapshot**: The practice of copying mutable product and address data (e.g., price, name, shipping address) into the order record at the time of creation, ensuring historical accuracy even if the original product or user details change later.
- **Webhook Deduplication**: The process of validating and ignoring duplicate event notifications sent by external providers (e.g., payment gateways) by tracking unique event IDs.
- **Cursor Pagination**: A pagination method using a pointer (cursor) to a specific record in the dataset, often preferred over offset pagination for large, frequently changing datasets.
- **Mass Assignment**: A vulnerability where users can update unauthorized object properties by passing unintended fields in the request payload. Prevented via explicit DTOs (Data Transfer Objects).
- **Minor Units**: Representing monetary values as integers of the smallest currency unit (e.g., cents or halalas) to avoid floating-point precision errors.
