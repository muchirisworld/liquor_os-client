import { boolean, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core"

import { lifecycleDates } from "./utils"

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: varchar("user_id", { length: 36 }), // uuid v4
  email: text("email").notNull().unique(),
  token: text("token").notNull().unique(),
  referredBy: text("referred_by"),
  communication: boolean("communication").default(false).notNull(),
  newsletter: boolean("newsletter").default(false).notNull(),
  marketing: boolean("marketing").default(false).notNull(),
  ...lifecycleDates,
})

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
