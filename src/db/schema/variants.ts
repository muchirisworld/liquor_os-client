import { relations } from "drizzle-orm"
import {
  decimal,
  index,
  integer,
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
 * variant_options defines attributes per product (e.g., Color, Size).
 */
export const variantOptions = pgTable(
  "variant_options",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    position: integer("position").default(0),
    ...lifecycleDates,
  },
  (table) => [
    index("variant_options_product_id_idx").on(table.productId),
  ]
)

export const variantOptionsRelations = relations(variantOptions, ({ one, many }) => ({
  product: one(products, { fields: [variantOptions.productId], references: [products.id] }),
  variantValues: many(variantValues),
}))

export type VariantOption = typeof variantOptions.$inferSelect
export type NewVariantOption = typeof variantOptions.$inferInsert

/**
 * variant_values defines possible values for an option (e.g., Red, Blue).
 */
export const variantValues = pgTable(
  "variant_values",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    optionId: uuid("option_id")
      .references(() => variantOptions.id, { onDelete: "cascade" })
      .notNull(),
    value: text("value").notNull(),
    ...lifecycleDates,
  },
  (table) => [
    index("variant_values_option_id_idx").on(table.optionId),
  ]
)

export const variantValuesRelations = relations(variantValues, ({ one, many }) => ({
  variantOption: one(variantOptions, { fields: [variantValues.optionId], references: [variantOptions.id] }),
  productVariantValues: many(productVariantValues),
}))

export type VariantValue = typeof variantValues.$inferSelect
export type NewVariantValue = typeof variantValues.$inferInsert

/**
 * product_variants represents a single variant SKU of a product.
 * Each row is a specific combination of variant values (e.g., Red / XL).
 */
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name"), // Optional human-readable name like "Red / XL"
    sku: text("sku"),
    price: decimal("price", { precision: 10, scale: 2 }), // Variant-specific price override
    inventory: integer("inventory").default(0), // Total inventory across all stocks for this variant
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
    productVariantValues: many(productVariantValues),
    stocks: many(stocks),
  })
)

export type ProductVariant = typeof productVariants.$inferSelect
export type NewProductVariant = typeof productVariants.$inferInsert

/**
 * Mapping between a specific Variant (SKU) and its constituent variantValues.
 */
export const productVariantValues = pgTable(
  "product_variant_values",
  {
    productVariantId: uuid("product_variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),
    variantValueId: uuid("variant_value_id")
      .references(() => variantValues.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({
      name: "product_variant_values_pk",
      columns: [table.productVariantId, table.variantValueId],
    }),
    index("product_variant_values_variant_id_idx").on(table.productVariantId),
    index("product_variant_values_value_id_idx").on(table.variantValueId),
  ]
)

export const productVariantValuesRelations = relations(
  productVariantValues,
  ({ one }) => ({
    productVariant: one(productVariants, {
      fields: [productVariantValues.productVariantId],
      references: [productVariants.id],
    }),
    variantValue: one(variantValues, {
      fields: [productVariantValues.variantValueId],
      references: [variantValues.id],
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

// Importing tags at the end to avoid circular dependency issues if possible, 
// though Drizzle handles it usually.
import { tags } from "./tags"

export const variantTagsRelations = relations(variantTags, ({ one }) => ({
  variant: one(variants, {
    fields: [variantTags.variantId],
    references: [variants.id],
  }),
  tag: one(tags, { fields: [variantTags.tagId], references: [tags.id] }),
}))

export type VariantTag = typeof variantTags.$inferSelect
export type NewVariantTag = typeof variantTags.$inferInsert
