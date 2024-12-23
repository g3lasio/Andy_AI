import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number"),
  dateOfBirth: text("date_of_birth"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  ssn: text("ssn"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'income' | 'expense'
  amount: decimal("amount").notNull(),
  category: text("category"),
  description: text("description"),
  date: timestamp("date").defaultNow(),
  plaidId: text("plaid_id").unique(),
  merchantName: text("merchant_name"),
  accountId: text("account_id"),
  pending: boolean("pending").default(false)
});

export const creditReports = pgTable("credit_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  score: integer("score").notNull(),
  reportDate: timestamp("report_date").defaultNow(),
  bureau: text("bureau").notNull(),
  factors: text("factors"),
  reportData: text("report_data")
});

export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  creditor: text("creditor").notNull(),
  accountNumber: text("account_number"),
  reason: text("reason").notNull(),
  status: text("status").notNull(), // 'pending' | 'sent' | 'resolved'
  letterContent: text("letter_content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  institutionName: text("institution_name").notNull(),
  accountType: text("account_type").notNull(),
  accountNumber: text("account_number").notNull(),
  balance: decimal("balance"),
  lastSync: timestamp("last_sync")
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  amount: decimal("amount").notNull(),
  frequency: text("frequency").notNull(), // 'monthly' | 'yearly'
  nextBilling: timestamp("next_billing"),
  active: boolean("active").default(true)
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type CreditReport = typeof creditReports.$inferSelect;
export type Dispute = typeof disputes.$inferSelect;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
