// backend/src/cron.ts
import { load } from "jsr:@std/dotenv";
await load({ export: true });
import postgres from "postgres";

const sql = postgres(Deno.env.get("DATABASE_URL")!);

async function sendReminders() {
  console.log("🔄 Running reminder job...");
  
  // Get loans due in 7 days
  const loans7Days = await sql`
    SELECT l.*, m.phone, m.full_name 
    FROM loans l
    JOIN members m ON l.member_id = m.id
    JOIN installments i ON l.id = i.loan_id
    WHERE i.status = 'pending'
    AND i.due_date = CURRENT_DATE + INTERVAL '7 days'
  `;
  
  // Send WhatsApp to each member
  for (const loan of loans7Days) {
    await fetch("http://localhost:3000/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: loan.phone,
        message: `Halo ${loan.full_name}, pengingat: angsuran ${loan.loan_number} jatuh tempo dalam 7 hari lagi.`,
      }),
    });
  }
  
  console.log(`✅ Sent ${loans7Days.length} reminders`);
}

// Run every day at 9 AM
setInterval(sendReminders, 24 * 60 * 60 * 1000);
sendReminders(); // Run immediately on start