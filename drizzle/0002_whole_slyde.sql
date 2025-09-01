CREATE TYPE "public"."app_type" AS ENUM('discord-bot', 'server', 'nextjs-app');--> statement-breakpoint
CREATE TABLE "app" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "app_type" NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"git_url" text NOT NULL,
	"git_branch" text DEFAULT 'main',
	"git_token" text,
	"git_folder" text DEFAULT '.',
	"environment_variables" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "desployment" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"start_command" text NOT NULL,
	"install_command" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app" ADD CONSTRAINT "app_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desployment" ADD CONSTRAINT "desployment_app_id_app_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."app"("id") ON DELETE cascade ON UPDATE no action;