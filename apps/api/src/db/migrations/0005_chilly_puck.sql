ALTER TYPE "public"."transaction_status" ADD VALUE 'pending_bendahara';--> statement-breakpoint
ALTER TYPE "public"."transaction_status" ADD VALUE 'pending_admin';--> statement-breakpoint
ALTER TYPE "public"."transaction_status" ADD VALUE 'rejected';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'alumni';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "approved_by_bendahara_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "approved_by_admin_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approved_by_bendahara_id_user_id_fk" FOREIGN KEY ("approved_by_bendahara_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_approved_by_admin_id_user_id_fk" FOREIGN KEY ("approved_by_admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;