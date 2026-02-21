CREATE TABLE "product_variant_tag_options" (
	"product_variant_id" uuid NOT NULL,
	"tag_option_id" uuid NOT NULL,
	CONSTRAINT "product_variant_tag_options_pk" PRIMARY KEY("product_variant_id","tag_option_id")
);
--> statement-breakpoint
ALTER TABLE "product_variant_values" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "product_variant_values" CASCADE;--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_variant_id_tags_id_fk";
--> statement-breakpoint
DROP INDEX "product_variants_variant_id_idx";--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "product_variant_tag_options" ADD CONSTRAINT "product_variant_tag_options_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_tag_options" ADD CONSTRAINT "product_variant_tag_options_tag_option_id_tag_options_id_fk" FOREIGN KEY ("tag_option_id") REFERENCES "public"."tag_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_variant_tag_options_variant_id_idx" ON "product_variant_tag_options" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "product_variant_tag_options_tag_option_id_idx" ON "product_variant_tag_options" USING btree ("tag_option_id");--> statement-breakpoint
ALTER TABLE "product_variants" DROP COLUMN "variant_id";