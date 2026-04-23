import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";
import { 
  members, 
  savings, 
  loans, 
  installments,
  memberStatusEnum,
  savingsTypeEnum,
  loanStatusEnum,
  installmentStatusEnum, syncLog
} from "./schema.ts";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { load } from "jsr:@std/dotenv";
import { eq, and, or, sql as drizzleSql } from "drizzle-orm";

// hybrid
interface SyncRecord {
  id: string;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id?: string;
  payload: any;
  idempotency_key: string;
}

await load({ export: true });

const DATABASE_URL = Deno.env.get("DATABASE_URL");
if (!DATABASE_URL) throw new Error("❌ DATABASE_URL not set");

const sql = postgres(DATABASE_URL, { prepare: false });
const db = drizzle(sql, { schema });

const app = new Hono();
app.use("/*", cors());

app.get("/", (c) => c.json({ 
  message: "🚀 KSP ERP API Running!",
  timestamp: new Date().toISOString()
}));

// Endpoint batch sync untuk offline data
app.post("/api/sync", async (c) => {
  const records: SyncRecord[] = await c.req.json();
  const results = [];
  
  for (const record of records) {
    try {
      // Cek idempotency - prevent duplikasi
      const existingSync = await db.select()
        .from(syncLog)
        .where(eq(syncLog.idempotencyKey, record.idempotency_key))
        .limit(1);
      
      if (existingSync.length > 0) {
        results.push({ 
          id: record.id, 
          status: "skipped", 
          message: "Already synced",
          data: existingSync[0] 
        });
        continue;
      }
      
      let result;
      
      // Proses berdasarkan tabel dan operasi
      switch (record.table_name) {
        case 'members':
          if (record.operation === 'INSERT') {
            [result] = await db.insert(members).values(record.payload).returning();
          } else if (record.operation === 'UPDATE' && record.record_id) {
            [result] = await db.update(members)
              .set(record.payload)
              .where(eq(members.id, record.record_id))
              .returning();
          }
          break;
          
        case 'savings':
          if (record.operation === 'INSERT') {
            [result] = await db.insert(savings).values(record.payload).returning();
          }
          break;
          
        case 'installments':
          if (record.operation === 'UPDATE' && record.record_id) {
            const installmentId = parseInt(record.record_id);
            [result] = await db.update(installments)
              .set(record.payload)
              .where(eq(installments.id, installmentId))
              .returning();
            
            // Update remaining loan jika bayar angsuran
            if (record.payload.status === 'paid' && record.payload.paid_date) {
              const installment = result;
              await drizzleSql`
                UPDATE loans 
                SET remaining = remaining - ${installment.amount}
                WHERE id = ${installment.loanId}
              `;
            }
          }
          break;
      }
      
      // Log sync sukses
      if (result) {
        await db.insert(syncLog).values({
          idempotencyKey: record.idempotency_key,
          tableName: record.table_name,
          operation: record.operation,
          recordId: record.record_id || null,
          payload: record.payload,
          syncedAt: new Date(),
        });
        
        results.push({ 
          id: record.id, 
          status: "success", 
          data: result 
        });
      }
    } catch (error: any) {
      console.error(`Sync failed for ${record.table_name}:`, error);
      results.push({ 
        id: record.id, 
        status: "failed", 
        error: error.message 
      });
    }
  }
  
  return c.json({ success: true, results });
});

// Endpoint untuk get pending sync status (optional - untuk monitoring)
app.get("/api/sync/status", async (c) => {
  const pendingCount = await db.select({ count: drizzleSql<number>`count(*)` })
    .from(syncLog)
    .then(r => r[0].count);
  
  return c.json({ 
    success: true, 
    data: {
      pendingSyncs: pendingCount,
      lastSync: new Date().toISOString()
    } 
  });
});

// GET all users
app.get("/users", async (c) => {
  try {
    const data = await db.query.users.findMany();
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CREATE user
const createUserSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

app.post("/users", zValidator("json", createUserSchema), async (c) => {
  try {
    const body = c.req.valid("json");
    const [newUser] = await db.insert(schema.users)
      .values(body)
      .returning();
    return c.json({ success: true, data: newUser }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ===== HELPER: Generate Nomor Anggota & Pinjaman =====
function generateMemberNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900) + 100;
  return `KSP-${year}-${random}`;
}

function generateLoanNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900) + 100;
  return `PJM-${year}-${random}`;
}

// ===== MEMBERS API =====

// GET all members
app.get("/members", async (c) => {
  try {
    const data = await db.query.members.findMany({
      with: {
        savings: true,
        loans: true,
      }
    });
    return c.json({ success: true, data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CREATE member
export const createMemberSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string(),
  address: z.string(),
  city: z.string().default("Magetan"),
  idCard: z.string().optional(),
});

// Update Member (semua field optional)
export const updateMemberSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  idCard: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).optional(),
});

app.post("/members", zValidator("json", createMemberSchema), async (c) => {
  try {
    const body = c.req.valid("json");
    const memberNumber = generateMemberNumber();
    
    const [newMember] = await db.insert(members)
      .values({ ...body, memberNumber })
      .returning();
    
    // Otomatis buat simpanan pokok (standar koperasi: Rp 100.000)
    await db.insert(savings).values({
      memberId: newMember.id,
      type: "pokok",
      amount: "100000",
      description: "Simpanan Pokok Awal",
    });
    
    return c.json({ success: true,  newMember }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ===== SAVINGS API =====

// GET savings by member
app.get("/savings/:memberId", async (c) => {
  try {
    const memberId = c.req.param("memberId");
    const data = await db.query.savings.findMany({
      where: (savings, { eq }) => eq(savings.memberId, memberId),
    });
    
    // Hitung total per jenis
    const totalPokok = data.filter(s => s.type === "pokok").reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const totalWajib = data.filter(s => s.type === "wajib").reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const totalSukarela = data.filter(s => s.type === "sukarela").reduce((sum, s) => sum + parseFloat(s.amount), 0);
    
    return c.json({ 
      success: true, 
      data,
      totals: {
        pokok: totalPokok,
        wajib: totalWajib,
        sukarela: totalSukarela,
        total: totalPokok + totalWajib + totalSukarela
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CREATE savings
export const createSavingsSchema = z.object({
  memberId: z.string().uuid(),
  type: z.enum(["pokok", "wajib", "sukarela"]),
  amount: z.string(),
  description: z.string().optional(),
});

app.post("/savings", zValidator("json", createSavingsSchema), async (c) => {
  try {
    const body = c.req.valid("json");
    const [newSaving] = await db.insert(savings)
      .values(body)
      .returning();
    
    return c.json({ success: true,  newSaving }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ===== LOANS API =====

// GET all loans (dengan optional filter memberId)
app.get("/loans", async (c) => {
  try {
    const memberId = c.req.query("memberId");
    
    let query = db.query.loans.findMany({
      with: {
        member: true,
        installments: true,
      }
    });
    
    // Jika ada filter memberId
    if (memberId) {
      const data = await db.query.loans.findMany({
        where: (loans, { eq }) => eq(loans.memberId, memberId),
        with: {
          member: true,
          installments: true,
        }
      });
      return c.json({ success: true,  data });
    }
    
    const data = await query;
    return c.json({ success: true,  data });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// CREATE loan dengan perhitungan bunga
export const createLoanSchema = z.object({
  memberId: z.string().uuid(),
  principal: z.string(),
  interestRate: z.string().default("12.00"),
  tenorMonths: z.number(),
});

// Schema untuk bayar angsuran
export const payInstallmentSchema = z.object({
  paidDate: z.string(),
});

app.post("/loans", zValidator("json", createLoanSchema), async (c) => {
  try {
    const body = c.req.valid("json");
    const principal = parseFloat(body.principal);
    const interestRate = parseFloat(body.interestRate);
    const tenorMonths = body.tenorMonths;
    
    // Hitung total pinjaman (bunga flat)
    // Total = Pokok + (Pokok * Bunga% * Tenor/12)
    const totalInterest = principal * (interestRate / 100) * (tenorMonths / 12);
    const totalAmount = principal + totalInterest;
    
    const loanNumber = generateLoanNumber();
    
    const [newLoan] = await db.insert(loans)
      .values({
        ...body,
        loanNumber,
        totalAmount: totalAmount.toString(),
        remaining: totalAmount.toString(),
      })
      .returning();
    
    // Buat jadwal angsuran
    const monthlyAmount = totalAmount / tenorMonths;
    const installmentsData = [];
    
    for (let i = 1; i <= tenorMonths; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      
      installmentsData.push({
        loanId: newLoan.id,
        installmentNumber: i,
        amount: monthlyAmount.toString(),
        dueDate: dueDate.toISOString().split('T')[0],
        status: "pending",
      });
    }
    
    await db.insert(installments).values(installmentsData);
    
    return c.json({ success: true,  newLoan }, 201);
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// APPROVE loan - FIX (gunakan imported eq operator)
app.patch("/loans/:id/approve", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    
    const [updatedLoan] = await db.update(loans)
      .set({ 
        status: "approved",
        approvedDate: new Date().toISOString().split('T')[0]
      })
      .where(eq(loans.id, id))  // ✅ Gunakan eq yang di-import
      .returning();
    
    return c.json({ success: true,  updatedLoan });
  } catch (error: any) {
    console.error("Approve loan error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// UPDATE member
app.patch("/members/:id", zValidator("json", updateMemberSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    
    const [updatedMember] = await db.update(members)
      .set({ 
        ...body,
        updatedAt: new Date().toISOString()
      })
      .where(eq(members.id, id))
      .returning();
    
    if (!updatedMember) {
      return c.json({ success: false, error: "Member not found" }, 404);
    }
    
    return c.json({ success: true,  updatedMember });
  } catch (error: any) {
    console.error("Update member error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PAY installment - FIX (hanya SATU definisi)
app.patch("/installments/:id/pay", zValidator("json", payInstallmentSchema), async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const body = c.req.valid("json");
    
    // 1. Ambil data installment dulu
    const installment = await db.query.installments.findFirst({
      where: (i, { eq }) => eq(i.id, id),
    });
    
    if (!installment) {
      return c.json({ success: false, error: "Installment not found" }, 404);
    }
    
    // 2. Update status installment
    await db.update(installments)
      .set({ 
        status: "paid",
        paidDate: body.paidDate
      })
      .where((i, { eq }) => eq(i.id, id));
    
    // 3. Update remaining loan dengan raw SQL (lebih reliable)
    await drizzleSql`
      UPDATE loans 
      SET remaining = remaining - ${installment.amount}
      WHERE id = ${installment.loanId}
    `;
    
    // 4. Jika remaining <= 0, set status loan ke "paid"
    const loan = await db.query.loans.findFirst({
      where: (l, { eq }) => eq(l.id, installment.loanId),
    });
    
    if (loan && parseFloat(loan.remaining) - parseFloat(installment.amount) <= 0) {
      await db.update(loans)
        .set({ status: "paid" })
        .where((l, { eq }) => eq(l.id, loan.id));
    }
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Pay installment error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ===== REPORTS API (Laporan Standar KSP) =====

// Laporan Simpanan Anggota
app.get("/reports/savings-summary", async (c) => {
  try {
    const allMembers = await db.query.members.findMany({
      with: { savings: true }
    });
    
    const report = allMembers.map(member => {
      const pokok = member.savings.filter(s => s.type === "pokok").reduce((sum, s) => sum + parseFloat(s.amount), 0);
      const wajib = member.savings.filter(s => s.type === "wajib").reduce((sum, s) => sum + parseFloat(s.amount), 0);
      const sukarela = member.savings.filter(s => s.type === "sukarela").reduce((sum, s) => sum + parseFloat(s.amount), 0);
      
      return {
        memberNumber: member.memberNumber,
        fullName: member.fullName,
        city: member.city,
        simpananPokok: pokok,
        simpananWajib: wajib,
        simpananSukarela: sukarela,
        totalSimpanan: pokok + wajib + sukarela
      };
    });
    
    const grandTotal = report.reduce((sum, r) => sum + r.totalSimpanan, 0);
    
    return c.json({ 
      success: true, 
      data: report,
      summary: {
        totalAnggota: allMembers.length,
        grandTotal,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Laporan Pinjaman Aktif
app.get("/reports/loans-active", async (c) => {
  try {
    const activeLoans = await db.query.loans.findMany({
      where: (loans, { eq, ne }) => eq(loans.status, "approved"),
      with: {
        member: true,
        installments: true,
      }
    });
    
    const report = activeLoans.map(loan => ({
      loanNumber: loan.loanNumber,
      memberNumber: loan.member.memberNumber,
      memberName: loan.member.fullName,
      pokokPinjaman: parseFloat(loan.principal),
      bunga: parseFloat(loan.interestRate),
      tenor: loan.tenorMonths,
      totalPinjaman: parseFloat(loan.totalAmount),
      sisaPinjaman: parseFloat(loan.remaining),
      status: loan.status
    }));
    
    const totalPokok = report.reduce((sum, r) => sum + r.pokokPinjaman, 0);
    const totalSisa = report.reduce((sum, r) => sum + r.sisaPinjaman, 0);
    
    return c.json({ 
      success: true, 
      data: report,
      summary: {
        totalPinjamanAktif: report.length,
        totalPokokPinjaman: totalPokok,
        totalSisaPinjaman: totalSisa,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Dashboard Statistics
app.get("/reports/dashboard", async (c) => {
  try {
    const activeMembers = await drizzleSql`SELECT COUNT(*) as count FROM members WHERE status = 'active'`;
    const savingsData = await drizzleSql`SELECT amount FROM savings`;
    const approvedLoans = await drizzleSql`SELECT total_amount, remaining, status FROM loans WHERE status = 'approved'`;
    
    const totalSimpanan = savingsData.reduce((sum: number, s: any) => sum + parseFloat(s.amount), 0);
    const totalPinjamanDistribusi = approvedLoans.reduce((sum: number, l: any) => sum + parseFloat(l.total_amount), 0);
    const totalSisaPinjaman = approvedLoans.reduce((sum: number, l: any) => sum + parseFloat(l.remaining), 0);
    const totalPinjamanLunas = approvedLoans.filter((l: any) => l.status === "paid").length;
    
    return c.json({
      success: true,
      data: {
        totalAnggotaAktif: parseInt(activeMembers[0].count),
        totalSimpanan,
        totalPinjamanDistribusi,
        totalSisaPinjaman,
        totalPinjamanLunas
      }
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export const sendWhatsAppSchema = z.object({
  phone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  message: z.string().min(1, "Pesan tidak boleh kosong"),
});

// WhatsApp Notification Endpoint (Fonnte Integration)
app.post("/api/send-whatsapp", async (c) => {
  try {
    const { phone, message } = await c.req.json();
    const FONNTE_TOKEN = Deno.env.get("FONNTE_TOKEN");
    
    if (!FONNTE_TOKEN) {
      // Fallback: return success tapi log warning
      console.warn("⚠️ FONNTE_TOKEN not set, skipping WhatsApp send");
      return c.json({ success: true, fallback: true, message: "Demo mode - no actual WA sent" });
    }
    
    // Format phone: remove + if present
    const formattedPhone = phone.replace(/^\+/, '');
    
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        "Authorization": FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: formattedPhone,
        message: message,
        countryCode: "62",
      }),
    });
    
    const result = await response.json();
    
    if (result.status === true || result.status === "true") {
      return c.json({ success: true, data: result });
    } else {
      return c.json({ success: false, error: result.message || "Failed to send" }, 400);
    }
  } catch (error: any) {
    console.error("WhatsApp API error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Auto-reminder endpoint (dijalankan cron job)
app.get("/api/send-reminder", async (c) => {
  // Logic untuk kirim reminder H-7, H-3, H-0
  // Query database untuk pinjaman yang akan jatuh tempo
  // Kirim WA ke anggota
  return c.json({ success: true, message: "Reminders sent" });
});


const port = 3000;
console.log(`🔥 Server running on http://localhost:${port}`);
Deno.serve({ port }, app.fetch);