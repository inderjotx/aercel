CREATE TYPE "public"."deployment_status" AS ENUM('pending', 'building', 'running', 'stopped');--> statement-breakpoint
CREATE TABLE "log" (
	"id" text PRIMARY KEY NOT NULL,
	"deployment_id" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"message" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "desployment" RENAME TO "deployment";--> statement-breakpoint
ALTER TABLE "deployment" DROP CONSTRAINT "desployment_app_id_app_id_fk";
--> statement-breakpoint
ALTER TABLE "app" ADD COLUMN "start_command" text;--> statement-breakpoint
ALTER TABLE "app" ADD COLUMN "install_command" text;--> statement-breakpoint
ALTER TABLE "app" ADD COLUMN "build_command" text;--> statement-breakpoint
ALTER TABLE "deployment" ADD COLUMN "status" "deployment_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "deployment" ADD COLUMN "container_id" text;--> statement-breakpoint
ALTER TABLE "deployment" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "deployment" ADD COLUMN "image_tag" text;--> statement-breakpoint
ALTER TABLE "deployment" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "log" ADD CONSTRAINT "log_deployment_id_deployment_id_fk" FOREIGN KEY ("deployment_id") REFERENCES "public"."deployment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployment" ADD CONSTRAINT "deployment_app_id_app_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."app"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deployment" DROP COLUMN "start_command";--> statement-breakpoint
ALTER TABLE "deployment" DROP COLUMN "install_command";