import {
  decimal,
  index,
  integer,
  json,
  pgTable,
  text,
  uuid
} from "drizzle-orm/pg-core"

import { type CheckoutItemSchema } from "@/lib/validations/cart"

import { addresses } from "./addresses"
import { stores } from "./stores"
import { lifecycleDates } from "./utils"

// @see: https://github.com/jackblatch/OneStopShop/blob/main/db/schema.ts
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    storeId: uuid("store_id")
      .references(() => stores.id, { onDelete: "cascade" })
      .notNull(),
    items: json("items").$type<CheckoutItemSchema[] | null>().default(null),
    quantity: integer("quantity"),
    amount: decimal("amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
    stripePaymentIntentStatus: text("stripe_payment_intent_status").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    addressId: uuid("address_id")
      .references(() => addresses.id, { onDelete: "cascade" })
      .notNull(),
    ...lifecycleDates,
  },
  (table) => [
    index("orders_store_id_idx").on(table.storeId),
    index("orders_address_id_idx").on(table.addressId),
  ]
)

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
