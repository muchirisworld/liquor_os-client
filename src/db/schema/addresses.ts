import { pgTable, text, uuid } from "drizzle-orm/pg-core"

import { lifecycleDates } from "./utils"

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  line1: text("line1"),
  line2: text("line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  ...lifecycleDates,
})

export type Address = typeof addresses.$inferSelect
export type NewAddress = typeof addresses.$inferInsert
