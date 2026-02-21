ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_variant_id_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_variant_id_tags_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;