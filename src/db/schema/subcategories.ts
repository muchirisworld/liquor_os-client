import { relations } from "drizzle-orm"
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core"

import { categories } from "./categories"
import { lifecycleDates } from "./utils"

export const subcategories = pgTable(
  "subcategories",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    name: text("name").notNull().unique(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
    ...lifecycleDates,
  },
  (table) => [index("subcategories_category_id_idx").on(table.categoryId)]
)

export const subcategoriesRelations = relations(subcategories, ({ one }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
}))

export type Subcategory = typeof subcategories.$inferSelect
export type NewSubcategory = typeof subcategories.$inferInsert
