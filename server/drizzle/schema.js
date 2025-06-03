import { relations, sql } from "drizzle-orm";
import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// short_link table
export const shortLinksTable = mysqlTable("short_link", {
  id: int().autoincrement().primaryKey(),
  url: varchar({ length: 40 }).notNull(),
  shortCode: varchar({ length: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  userId: int()
    .notNull()
    .references(() => usersTable.id),
});

// users table
export const usersTable = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 40 }).notNull(),
  email: varchar({ length: 40 }).notNull().unique(),
  password: varchar({ length: 255 }),
  avatarUrl: text(),
  isEmailValid: boolean().default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// session table
export const sessionsTable = mysqlTable("sessions", {
  id: int().autoincrement().primaryKey(),
  userId: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  valid: boolean().default(true).notNull(),
  userAgent: text(),
  ip: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// verify email tokens table
export const verifyEmailTokensTable = mysqlTable("verify_email_tokens", {
  id: int().autoincrement().primaryKey(),
  userId: int()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar({ length: 8 }).notNull(),
  expiresAt: timestamp("expires_at")
    .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// A user can have many short link & sessions
export const usersRelation = relations(usersTable, ({ many }) => ({
  shortLink: many(shortLinksTable),
  session: many(sessionsTable),
}));

// A short link belongs to a user
export const shortLinksRelation = relations(shortLinksTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [shortLinksTable.userId], //foreign key
    references: [usersTable.id],
  }),
}));

// A session token belongs to a user
export const sessionsRelation = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId], // foreign key
    references: [usersTable.id],
  }),
}));
