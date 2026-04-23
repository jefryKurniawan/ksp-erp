import { 
  pgTable, 
  serial, 
  text, 
  numeric, 
  timestamp, 
  uuid, 
  integer,
  date,
  pgEnum 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums untuk status
export const memberStatusEnum = pgEnum("member_status", ["active", "inactive"]);
export const savingsTypeEnum = pgEnum("savings_type", ["pokok", "wajib", "sukarela"]);
export const loanStatusEnum = pgEnum("loan_status", ["pending", "approved", "rejected", "paid"]);
export const installmentStatusEnum = pgEnum("installment_status", ["pending", "paid", "overdue"]);

// 1. MEMBERS
export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberNumber: text("member_number").unique().notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").unique(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").default("Magetan"),
  idCard: text("id_card").unique(),
  joinedDate: date("joined_date").defaultNow(),
  status: memberStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Buat tabel sync_log 
export const syncLog = pgTable("sync_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  idempotencyKey: text("idempotency_key").unique().notNull(),
  endpoint: text("endpoint").notNull(),
  syncedAt: timestamp("synced_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 2. SAVINGS
export const savings = pgTable("savings", {
  id: serial("id").primaryKey(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  type: savingsTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  transactionDate: date("transaction_date").defaultNow().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. LOANS
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  loanNumber: text("loan_number").unique().notNull(),
  principal: numeric("principal", { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).default("12.00"),
  tenorMonths: integer("tenor_months").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  remaining: numeric("remaining", { precision: 12, scale: 2 }).notNull(),
  status: loanStatusEnum("status").default("pending"),
  approvedDate: date("approved_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. INSTALLMENTS
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  installmentNumber: integer("installment_number").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  paidDate: date("paid_date"),
  status: installmentStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// RELATIONS
export const membersRelations = relations(members, ({ many }) => ({
  savings: many(savings),
  loans: many(loans),
}));

export const savingsRelations = relations(savings, ({ one }) => ({
  member: one(members, {
    fields: [savings.memberId],
    references: [members.id],
  }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  member: one(members, {
    fields: [loans.memberId],
    references: [members.id],
  }),
  installments: many(installments),
}));

export const installmentsRelations = relations(installments, ({ one }) => ({
  loan: one(loans, {
    fields: [installments.loanId],
    references: [loans.id],
  }),
}));

