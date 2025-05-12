CREATE TYPE "public"."guess_type" AS ENUM('up', 'down');--> statement-breakpoint
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
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "guess_resolutions" ADD CONSTRAINT "guess_resolutions_guess_id_guesses_id_fk" FOREIGN KEY ("guess_id") REFERENCES "public"."guesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guess_id_idx" ON "guess_resolutions" USING btree ("guess_id");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "guesses" USING btree ("user_id");--> statement-breakpoint
CREATE VIEW "public"."resolved_guesses" AS (select "guesses"."id", "guesses"."user_id", "guesses"."guess", "guesses"."guess_price", "guess_resolutions"."resolved_at", "guess_resolutions"."resolved_price", CASE WHEN ("guesses"."guess_price" < "guess_resolutions"."resolved_price" AND "guesses"."guess" = 'up') OR ("guesses"."guess_price" > "guess_resolutions"."resolved_price" AND "guesses"."guess" = 'down') THEN true ELSE false END as "is_correct" from "guesses" inner join "guess_resolutions" on "guesses"."id" = "guess_resolutions"."guess_id" where "guess_resolutions"."resolved_at" is not null);