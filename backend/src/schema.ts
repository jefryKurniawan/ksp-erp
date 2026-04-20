// import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   fullName: text('full_name'),
//   phone: varchar('phone', { length: 256 }),
// });

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

// 1. MEMBERS (Anggota)
export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberNumber: text("member_number").unique().notNull(), // KSP-2026-001
  fullName: text("full_name").notNull(),
  email: text("email").unique(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").default("Magetan"), // Default Magetan
  idCard: text("id_card").unique(), // NIK
  joinedDate: date("joined_date").defaultNow(),
  status: memberStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. SAVINGS (Simpanan)
export const savings = pgTable("savings", {
  id: serial("id").primaryKey(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  type: savingsTypeEnum("type").notNull(), // pokok/wajib/sukarela
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  transactionDate: date("transaction_date").defaultNow().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 3. LOANS (Pinjaman)
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  memberId: uuid("member_id").references(() => members.id).notNull(),
  loanNumber: text("loan_number").unique().notNull(), // PJM-2026-001
  principal: numeric("principal", { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).default("12.00"), // Default 12% per tahun
  tenorMonths: integer("tenor_months").notNull(), // Jangka waktu (bulan)
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(), // Pokok + Bunga
  remaining: numeric("remaining", { precision: 12, scale: 2 }).notNull(), // Sisa pinjaman
  status: loanStatusEnum("status").default("pending"),
  approvedDate: date("approved_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 4. INSTALLMENTS (Angsuran)
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").references(() => loans.id).notNull(),
  installmentNumber: integer("installment_number").notNull(), // Angsuran ke-
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