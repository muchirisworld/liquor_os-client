ALTER TABLE "tag_presets" ADD COLUMN "tag_name" text NOT NULL;--> statement-breakpoint
CREATE INDEX "tag_presets_tag_name_idx" ON "tag_presets" USING btree ("tag_name");