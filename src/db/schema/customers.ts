import { relations } from "drizzle-orm"
import { index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core"

import { stores } from "./stores"
import { lifecycleDates } from "./utils"

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    name: text("name"),
    email: text("email"),
    storeConnectId: varchar("store_connect_id").unique(), // stripe connect
    stripeCustomerId: varchar("stripe_customer_id").unique().notNull(),
    storeId: uuid("store_id")
      .references(() => stores.id, { onDelete: "cascade" })
      .notNull(),
    ...lifecycleDates,
  },
  (table) => [
    index("customers_store_id_idx").on(table.storeId),
    index("customers_stripe_customer_id_idx").on(table.stripeCustomerId),
  ]
)

export const customersRelations = relations(customers, ({ one }) => ({
  store: one(stores, {
    fields: [customers.storeId],
    references: [stores.id],
  }),
}))

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
