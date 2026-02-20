-- Drop foreign key constraints first
ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "customers_store_id_stores_id_fk";
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_store_id_stores_id_fk";
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_store_id_stores_id_fk";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_store_id_stores_id_fk";
ALTER TABLE "tags" DROP CONSTRAINT IF EXISTS "tags_store_id_stores_id_fk";
ALTER TABLE "variants" DROP CONSTRAINT IF EXISTS "variants_store_id_stores_id_fk";

-- Alter stores.id first (drop default, then change type)
ALTER TABLE "stores" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "stores" ALTER COLUMN "id" SET DATA TYPE varchar;

-- Now alter all foreign key columns
ALTER TABLE "customers" ALTER COLUMN "store_id" SET DATA TYPE varchar;
ALTER TABLE "orders" ALTER COLUMN "store_id" SET DATA TYPE varchar;
ALTER TABLE "payments" ALTER COLUMN "store_id" SET DATA TYPE varchar;
ALTER TABLE "products" ALTER COLUMN "store_id" SET DATA TYPE varchar;
ALTER TABLE "tags" ALTER COLUMN "store_id" SET DATA TYPE varchar;
ALTER TABLE "variants" ALTER COLUMN "store_id" SET DATA TYPE varchar;

-- Re-add foreign key constraints
ALTER TABLE "customers" ADD CONSTRAINT "customers_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade;
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade;
ALTER TABLE "payments" ADD CONSTRAINT "payments_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade;
ALTER TABLE "products" ADD CONSTRAINT "products_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade;
ALTER TABLE "tags" ADD CONSTRAINT "tags_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade;
ALTER TABLE "variants" ADD CONSTRAINT "variants_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE cascade;
