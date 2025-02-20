ALTER TABLE "drinks_stats" ADD PRIMARY KEY ("ean");--> statement-breakpoint
ALTER TABLE "drinks_stats" ALTER COLUMN "ean" SET NOT NULL;