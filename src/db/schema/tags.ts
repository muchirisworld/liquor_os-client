import { relations } from "drizzle-orm"
import {
  index,
  json,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid,
  varchar
} from "drizzle-orm/pg-core"

import { products } from "./products"
import { stores } from "./stores"
import { lifecycleDates } from "./utils"

/**
 * store tags are now strictly for metadata/filtering (e.g., "Organic", "Summer").
 * They no longer drive product variants.
 */
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    name: text("name").notNull(),
    storeId: varchar("store_id")
      .references(() => stores.id, { onDelete: "cascade" })
      .notNull(),
    ...lifecycleDates,
  },
  (table) => [
    unique("tags_name_store_id_unique")
      .on(table.name, table.storeId)
      .nullsNotDistinct(),
    index("tags_store_id_idx").on(table.storeId),
  ]
)

export const tagsRelations = relations(tags, ({ one, many }) => ({
  store: one(stores, { fields: [tags.storeId], references: [stores.id] }),
  products: many(productTags, {
    relationName: "productTags",
  }),
}))

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

export const productTags = pgTable(
  "product_tags",
  {
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
    ...lifecycleDates,
  },
  (table) => [
    primaryKey({
      name: "product_tags_pk",
      columns: [table.productId, table.tagId],
    }),
    index("product_tags_product_id_tag_id_idx").on(table.productId, table.tagId),
  ]
)

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
    relationName: "productTags",
  }),
  tag: one(tags, { fields: [productTags.tagId], references: [tags.id] }),
}))

export type ProductTag = typeof productTags.$inferSelect
export type NewProductTag = typeof productTags.$inferInsert

export const tagPresets = pgTable(
  "tag_presets",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    storeId: varchar("store_id")
      .references(() => stores.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    tagName: text("tag_name").notNull(),
    options: json("options").$type<string[]>().notNull(), // Presets can still have suggested options/values
    ...lifecycleDates,
  },
  (table) => [
    index("tag_presets_store_id_idx").on(table.storeId),
    index("tag_presets_tag_name_idx").on(table.tagName),
  ]
)

export const tagPresetsRelations = relations(tagPresets, ({ one }) => ({
  store: one(stores, { fields: [tagPresets.storeId], references: [stores.id] }),
}))

export type TagPreset = typeof tagPresets.$inferSelect
export type NewTagPreset = typeof tagPresets.$inferInsert
