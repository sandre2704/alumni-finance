-- Script: Cleanup Non-Admin Users
-- Purpose: Deletes all users who do not have the 'admin' role, along with their related data.
-- Usage: Run this in DBeaver connected to your PostgreSQL database.

BEGIN;

-- 1. Create a temporary table to store the IDs of users to be deleted
-- This ensures we are targeting the exact same set of users for all deletion steps
CREATE TEMP TABLE users_to_delete AS
SELECT id, email
FROM "user"
WHERE role != 'admin';

-- Optional: Check who will be deleted before running the deletes
-- SELECT * FROM users_to_delete;

-- 2. Delete related Sessions
DELETE FROM "session"
WHERE "user_id" IN (SELECT id FROM users_to_delete);

-- 3. Delete related Accounts (OAuth/Password linkage)
DELETE FROM "account"
WHERE "user_id" IN (SELECT id FROM users_to_delete);

-- 4. Delete related Verifications (Email verification tokens)
DELETE FROM "verification"
WHERE "identifier" IN (SELECT email FROM users_to_delete);

-- 5. Delete related Transactions (created by these users)
-- Note: If you want to KEEP transactions but set creator to NULL, user UPDATE instead.
-- Here we delete them to avoid orphan records if that is preferred.
DELETE FROM "transactions"
WHERE "created_by" IN (SELECT id FROM users_to_delete);

-- 6. Finally, delete the Users
DELETE FROM "user"
WHERE "id" IN (SELECT id FROM users_to_delete);

-- 7. Returns the emails of deleted users for confirmation
SELECT email as deleted_user_email FROM users_to_delete;

-- Drop temporary table
DROP TABLE users_to_delete;

COMMIT;

-- Rollback if something goes wrong (execute this ONLY if you haven't committed yet and want to undo)
-- ROLLBACK;
