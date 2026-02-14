import { relations } from "drizzle-orm"
import {
  index,
  pgTable,
  primaryKey,
  text,
  unique,
  uuid
} from "drizzle-orm/pg-core"

import { products } from "./products"
import { stores } from "./stores"
import { lifecycleDates } from "./utils"

// store tags
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    name: text("name").notNull(),
    color: text("color").notNull().default("blue"),
    storeId: uuid("store_id")
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
  }),
  tag: one(tags, { fields: [productTags.tagId], references: [tags.id] }),
}))

export type ProductTag = typeof productTags.$inferSelect
export type NewProductTag = typeof productTags.$inferInsert
