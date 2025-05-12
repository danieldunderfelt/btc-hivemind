CREATE TYPE "public"."guess_type" AS ENUM('up', 'down');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "guess_resolutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guess_id" uuid NOT NULL,
	"resolved_price" numeric NOT NULL,
	"resolved_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"guess" "guess_type" NOT NULL,
	"guess_price" numeric NOT NULL,
	"guessed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guess_resolutions" ADD CONSTRAINT "guess_resolutions_guess_id_guesses_id_fk" FOREIGN KEY ("guess_id") REFERENCES "public"."guesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guess_id_idx" ON "guess_resolutions" USING btree ("guess_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "guesses" USING btree ("user_id");--> statement-breakpoint
CREATE VIEW "public"."resolved_guesses" AS (select "guesses"."id", "guesses"."user_id", "guesses"."guess", "guesses"."guess_price", "guesses"."guessed_at", "guess_resolutions"."resolved_at", "guess_resolutions"."resolved_price", CASE WHEN ("guesses"."guess_price" < "guess_resolutions"."resolved_price" AND "guesses"."guess" = 'up') OR ("guesses"."guess_price" > "guess_resolutions"."resolved_price" AND "guesses"."guess" = 'down') THEN true ELSE false END as "is_correct" from "guesses" inner join "guess_resolutions" on "guesses"."id" = "guess_resolutions"."guess_id" where "guess_resolutions"."resolved_at" is not null);
CREATE VIEW "public"."all_guesses" AS (select "guesses"."id", "guesses"."user_id", "guesses"."guess", "guesses"."guess_price", "guesses"."guessed_at", "resolved_guesses"."resolved_at", "resolved_guesses"."resolved_price", "is_correct" from "guesses" left join "resolved_guesses" on "guesses"."id" = "resolved_guesses"."id");--> statement-breakpoint