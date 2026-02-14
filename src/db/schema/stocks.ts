import { relations } from "drizzle-orm"
import { index, integer, pgTable, uuid } from "drizzle-orm/pg-core"

import { lifecycleDates } from "./utils"
import { productVariants, productVariantValues } from "./variants"

export const stocks = pgTable(
  "stocks",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    productVariantId: uuid("product_variant_id")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),
    quantity: integer("quantity").notNull().default(0),
    ...lifecycleDates,
  },
  (table) => [index("stocks_product_variant_id_idx").on(table.productVariantId)]
)

export const stocksRelations = relations(stocks, ({ one }) => ({
  productVariant: one(productVariants, {
    fields: [stocks.productVariantId],
    references: [productVariants.id],
  }),
  productVariantValues: one(productVariantValues, {
    fields: [stocks.productVariantId],
    references: [productVariantValues.productVariantId],
  }),
}))

export type Stock = typeof stocks.$inferSelect
export type NewStock = typeof stocks.$inferInsert
