import { boolean, json, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core"

import { type CartItemSchema } from "@/lib/validations/cart"

import { lifecycleDates } from "./utils"

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  paymentIntentId: varchar("payment_intent_id", { length: 256 }),
  clientSecret: text("client_secret"),
  items: json("items").$type<CartItemSchema[] | null>().default(null),
  closed: boolean("closed").notNull().default(false),
  ...lifecycleDates,
})

export type Cart = typeof carts.$inferSelect
export type NewCart = typeof carts.$inferInsert
