CREATE TABLE "drinks" (
	"ean" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo" text NOT NULL,
	"volume" integer NOT NULL,
	"description_en" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drinks_stats" (
	"ean" text,
	"total_votes" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"winner_ean" text NOT NULL,
	"loser_ean" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "drinks_stats" ADD CONSTRAINT "drinks_stats_ean_drinks_ean_fk" FOREIGN KEY ("ean") REFERENCES "public"."drinks"("ean") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_winner_ean_drinks_ean_fk" FOREIGN KEY ("winner_ean") REFERENCES "public"."drinks"("ean") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_loser_ean_drinks_ean_fk" FOREIGN KEY ("loser_ean") REFERENCES "public"."drinks"("ean") ON DELETE no action ON UPDATE no action;