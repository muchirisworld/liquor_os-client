import { relations } from "drizzle-orm"
import {
  decimal,
  index,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
  varchar
} from "drizzle-orm/pg-core"

import { products } from "./products"
import { stocks } from "./stocks"
import { stores } from "./stores"
import { lifecycleDates } from "./utils"
import { tags } from "./tags"

// store variants
export const variants = pgTable(
  "variants",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    storeId: varchar("store_id")
      .references(() => stores.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    ...lifecycleDates,
  },
  (table) => [
    unique("variants_name_store_id_unique")
      .on(table.name, table.storeId)
      .nullsNotDistinct(),
    index("variants_store_id_idx").on(table.storeId),
  ]
)

export const variantsRelations = relations(variants, ({ one }) => ({
  store: one(stores, { fields: [variants.storeId], references: [stores.id] }),
}))

export type Variant = typeof variants.$inferSelect
export type NewVariant = typeof variants.$inferInsert

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    variantId: uuid("variant_id")
      .references(() => variants.id, { onDelete: "cascade" })
      .notNull(),
    ...lifecycleDates,
  },
  (table) => [
    index("product_variants_product_id_idx").on(table.productId),
    index("product_variants_variant_id_idx").on(table.variantId),
  ]
)

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    variant: one(variants, {
      fields: [productVariants.variantId],
      references: [variants.id],
    }),
    productVariantValues: many(productVariantValues),
  })
)

export type ProductVariant = typeof productVariants.$inferSelect
export type NewProductVariant = typeof productVariants.$inferInsert

export const productVariantValues = pgTable(
  "product_variant_values",
  {
    productVariantId: uuid("product_variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),
    value: text("value").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    stockId: uuid("stock_id")
      .references(() => stocks.id, { onDelete: "cascade" })
      .notNull(),
    ...lifecycleDates,
  },
  (table) => [
    primaryKey({
      name: "product_variant_values_pk",
      columns: [table.productVariantId, table.value],
    }),
    index("variant_values_product_variant_id_idx").on(table.productVariantId),
    index("variant_values_stock_id_idx").on(table.stockId),
  ]
)

export const productVariantValuesRelations = relations(
  productVariantValues,
  ({ one }) => ({
    productVariant: one(productVariants, {
      fields: [productVariantValues.productVariantId],
      references: [productVariants.id],
    }),
  })
)

export type ProductVariantValue = typeof productVariantValues.$inferSelect
export type NewProductVariantValue = typeof productVariantValues.$inferInsert

export const variantTags = pgTable(
  "variant_tags",
  {
    variantId: uuid("variant_id")
      .references(() => variants.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
    ...lifecycleDates,
  },
  (table) => [
    primaryKey({
      name: "variant_tags_pk",
      columns: [table.variantId, table.tagId],
    }),
    index("variant_tags_variant_id_tag_id_idx").on(
      table.variantId,
      table.tagId
    ),
  ]
)

export const variantTagsRelations = relations(variantTags, ({ one }) => ({
  variant: one(variants, {
    fields: [variantTags.variantId],
    references: [variants.id],
  }),
  tag: one(tags, { fields: [variantTags.tagId], references: [tags.id] }),
}))

export type VariantTag = typeof variantTags.$inferSelect
export type NewVariantTag = typeof variantTags.$inferInsert