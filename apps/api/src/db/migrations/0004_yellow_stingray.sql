ALTER TABLE "sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "order_id" varchar(100);--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_unique" UNIQUE("order_id");