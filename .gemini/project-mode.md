# Project Mode Rules

This workspace inherits global core policies and resolves the specific skill profiles configured in the registry.

## Local Project Rules
- **Database Migrations**: Every new table creation must include policies for RLS, and all policy creations must begin with a corresponding `DROP POLICY IF EXISTS ... ON ...` statement to ensure idempotency.
- **Service Worker Compilation**: Any changes to worker templates must be validated via standard compilation runs.
- **Client Side Effects**: React state synchronization must occur inside dispatch handlers, or utilize standard functional hooks where necessary.
