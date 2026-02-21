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
import { tags, tagOptions } from "./tags"

// store variants (Legacy - Consider removal if tags fulfill all needs)
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

/**
 * product_variants represents a single variant SKU of a product.
 * Each row is a specific combination of tag options (e.g., Red / XL).
 */
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name"), // Optional human-readable name like "Red / XL"
    price: decimal("price", { precision: 10, scale: 2 }), // Variant-specific price override
    ...lifecycleDates,
  },
  (table) => [
    index("product_variants_product_id_idx").on(table.productId),
  ]
)

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
      relationName: "productVariants",
    }),
    productVariantTagOptions: many(productVariantTagOptions),
    stocks: many(stocks),
  })
)

export type ProductVariant = typeof productVariants.$inferSelect
export type NewProductVariant = typeof productVariants.$inferInsert

/**
 * many-to-many relationship between product variants and tag options.
 * A variant (SKU) is defined by one or more tag options.
 */
export const productVariantTagOptions = pgTable(
  "product_variant_tag_options",
  {
    productVariantId: uuid("product_variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),
    tagOptionId: uuid("tag_option_id")
      .references(() => tagOptions.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "product_variant_tag_options_pk",
      columns: [table.productVariantId, table.tagOptionId],
    }),
    index("product_variant_tag_options_variant_id_idx").on(table.productVariantId),
    index("product_variant_tag_options_tag_option_id_idx").on(table.tagOptionId),
  ]
)

export const productVariantTagOptionsRelations = relations(
  productVariantTagOptions,
  ({ one }) => ({
    productVariant: one(productVariants, {
      fields: [productVariantTagOptions.productVariantId],
      references: [productVariants.id],
    }),
    tagOption: one(tagOptions, {
      fields: [productVariantTagOptions.tagOptionId],
      references: [tagOptions.id],
    }),
  })
)

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