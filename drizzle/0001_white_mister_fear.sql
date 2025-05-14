ALTER TABLE "guess_resolutions" DROP CONSTRAINT "guess_resolutions_guess_id_guesses_id_fk";
--> statement-breakpoint
ALTER TABLE "guess_resolutions" ADD CONSTRAINT "guess_resolutions_guess_id_guesses_id_fk" FOREIGN KEY ("guess_id") REFERENCES "public"."guesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guess_resolutions" ADD CONSTRAINT "guess_id_unique" UNIQUE("guess_id");