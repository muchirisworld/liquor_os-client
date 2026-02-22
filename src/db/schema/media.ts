import { relations } from "drizzle-orm"
import {
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core"

import { products } from "./products"
import { productVariants, variantValues } from "./variants"
import { lifecycleDates } from "./utils"

/**
 * media table stores image URLs and metadata.
 * It can be linked to a product, a specific variant SKU, 
 * or a specific variant value (e.g., all "Red" items).
 */
export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    url: text("url").notNull(),
    name: text("name"),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    variantId: uuid("variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" }),
    variantValueId: uuid("variant_value_id")
      .references(() => variantValues.id, { onDelete: "cascade" }),
    position: integer("position").default(0),
    ...lifecycleDates,
  }
)

export const mediaRelations = relations(media, ({ one }) => ({
  product: one(products, {
    fields: [media.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [media.variantId],
    references: [productVariants.id],
  }),
  variantValue: one(variantValues, {
    fields: [media.variantValueId],
    references: [variantValues.id],
  }),
}))

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
