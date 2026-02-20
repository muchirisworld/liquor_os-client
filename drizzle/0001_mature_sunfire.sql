CREATE TABLE "tag_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variant_tags" (
	"variant_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "variant_tags_pk" PRIMARY KEY("variant_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "tag_options" ADD CONSTRAINT "tag_options_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_tags" ADD CONSTRAINT "variant_tags_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variant_tags" ADD CONSTRAINT "variant_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "variant_tags_variant_id_tag_id_idx" ON "variant_tags" USING btree ("variant_id","tag_id");--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN "color";